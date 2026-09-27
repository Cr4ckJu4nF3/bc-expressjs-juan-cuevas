// src/repositories/metrics.repository.ts — Acceso a datos con Mongoose
import mongoose from 'mongoose';
import { Metric } from '../models/metric.model';
import { AppError } from '../errors/AppError';
import { CreateMetricDto, UpdateMetricDto } from '../schemas/metric.schema';

interface FindAllParams {
  page: number;
  limit: number;
  campaignId?: string | undefined;
  channel?: string | undefined;
}

export async function findAll({ page, limit, campaignId, channel }: FindAllParams) {
  const filter: Record<string, unknown> = {};
  if (campaignId) filter['campaignId'] = campaignId;
  if (channel) filter['channel'] = channel;

  const [metrics, total] = await Promise.all([
    Metric.find(filter)
      .sort({ date: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean(),
    Metric.countDocuments(filter),
  ]);
  return { data: metrics, total, page, limit };
}

export async function findById(id: string) {
  assertValidObjectId(id);
  return Metric.findById(id).lean();
}

export async function create(data: CreateMetricDto) {
  try {
    const created = await Metric.create(data);
    return created.toObject();
  } catch (err) {
    throw toAppError(err, 'crear');
  }
}

export async function update(id: string, data: UpdateMetricDto) {
  assertValidObjectId(id);
  try {
    const updated = await Metric.findByIdAndUpdate(id, data, {
      new: true,
      runValidators: true,
    }).lean();
    if (!updated) throw new AppError(404, 'Métrica no encontrada');
    return updated;
  } catch (err) {
    if (err instanceof AppError) throw err;
    throw toAppError(err, 'actualizar');
  }
}

export async function remove(id: string): Promise<void> {
  assertValidObjectId(id);
  const deleted = await Metric.findByIdAndDelete(id);
  if (!deleted) throw new AppError(404, 'Métrica no encontrada');
}

// Framework de agregación: totales por canal para una campaña dada.
export async function summaryByCampaign(campaignId: string) {
  return Metric.aggregate([
    { $match: { campaignId } },
    {
      $group: {
        _id: '$channel',
        totalImpressions: { $sum: '$impressions' },
        totalClicks: { $sum: '$clicks' },
        totalConversions: { $sum: '$conversions' },
        totalSpend: { $sum: '$spend' },
        days: { $sum: 1 },
      },
    },
    { $sort: { totalSpend: -1 } },
  ]);
}

function assertValidObjectId(id: string): void {
  if (!mongoose.isValidObjectId(id)) {
    throw new AppError(400, 'ID inválido');
  }
}

function toAppError(err: unknown, action: 'crear' | 'actualizar'): AppError | unknown {
  if (isDuplicateKeyError(err)) {
    return new AppError(409, 'Ya existe una métrica para esa campaña, canal y fecha');
  }
  if (err instanceof mongoose.Error.ValidationError) {
    const message = Object.values(err.errors)
      .map((e) => e.message)
      .join('; ');
    return new AppError(400, `No se pudo ${action} la métrica: ${message}`);
  }
  return err;
}

function isDuplicateKeyError(err: unknown): boolean {
  return typeof err === 'object' && err !== null && (err as { code?: number }).code === 11000;
}
