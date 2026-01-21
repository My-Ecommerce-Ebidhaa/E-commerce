import { Model, QueryBuilder, Transaction } from 'objection';
import { PaginatedResult, PaginationMeta } from '@/shared/utils/response.util';

export interface QueryOptions {
  page?: number;
  limit?: number;
  orderBy?: string;
  orderDir?: 'asc' | 'desc';
  withRelations?: string[];
}

export abstract class BaseRepository<T extends Model> {
  protected model: typeof Model;

  constructor(model: typeof Model) {
    this.model = model;
  }

  async findById(id: string, relations?: string[]): Promise<T | undefined> {
    let query = this.model.query().findById(id);

    if (relations?.length) {
      query = query.withGraphFetched(`[${relations.join(', ')}]`);
    }

    return query as unknown as Promise<T | undefined>;
  }

  async findOne(conditions: Partial<T>, relations?: string[]): Promise<T | undefined> {
    let query = this.model.query().findOne(conditions as object);

    if (relations?.length) {
      query = query.withGraphFetched(`[${relations.join(', ')}]`);
    }

    return query as unknown as Promise<T | undefined>;
  }

  async findAll(conditions?: Partial<T>, options?: QueryOptions): Promise<T[]> {
    let query = this.model.query();

    if (conditions) {
      query = query.where(conditions as object);
    }

    if (options?.orderBy) {
      query = query.orderBy(options.orderBy, options.orderDir || 'asc');
    }

    if (options?.withRelations?.length) {
      query = query.withGraphFetched(`[${options.withRelations.join(', ')}]`);
    }

    if (options?.limit) {
      const offset = ((options.page || 1) - 1) * options.limit;
      query = query.offset(offset).limit(options.limit);
    }

    return query as unknown as Promise<T[]>;
  }

  async paginate(
    conditions: Partial<T> | object = {},
    options: QueryOptions = {}
  ): Promise<PaginatedResult<T>> {
    const page = Math.max(1, options.page || 1);
    const limit = Math.min(100, Math.max(1, options.limit || 20));
    const offset = (page - 1) * limit;

    let query = this.model.query().where(conditions as object);

    if (options.orderBy) {
      query = query.orderBy(options.orderBy, options.orderDir || 'asc');
    }

    if (options.withRelations?.length) {
      query = query.withGraphFetched(`[${options.withRelations.join(', ')}]`);
    }

    const [data, countResult] = await Promise.all([
      query.clone().offset(offset).limit(limit),
      this.model.query().where(conditions as object).count('* as count').first(),
    ]);

    const total = Number((countResult as { count: string })?.count || 0);

    return {
      data: data as T[],
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async create(data: Partial<T>, trx?: Transaction): Promise<T> {
    const query = trx ? this.model.query(trx) : this.model.query();
    return query.insert(data as object).returning('*') as unknown as Promise<T>;
  }

  async createMany(data: Partial<T>[], trx?: Transaction): Promise<T[]> {
    const query = trx ? this.model.query(trx) : this.model.query();
    return query.insert(data as object[]).returning('*') as unknown as Promise<T[]>;
  }

  async update(id: string, data: Partial<T>, trx?: Transaction): Promise<T> {
    const query = trx ? this.model.query(trx) : this.model.query();
    return query.patchAndFetchById(id, data as object) as unknown as Promise<T>;
  }

  async updateWhere(
    conditions: Partial<T>,
    data: Partial<T>,
    trx?: Transaction
  ): Promise<number> {
    const query = trx ? this.model.query(trx) : this.model.query();
    return query.patch(data as object).where(conditions as object);
  }

  async delete(id: string, trx?: Transaction): Promise<number> {
    const query = trx ? this.model.query(trx) : this.model.query();
    return query.deleteById(id);
  }

  async deleteWhere(conditions: Partial<T>, trx?: Transaction): Promise<number> {
    const query = trx ? this.model.query(trx) : this.model.query();
    return query.delete().where(conditions as object);
  }

  async count(conditions?: Partial<T>): Promise<number> {
    let query = this.model.query();

    if (conditions) {
      query = query.where(conditions as object);
    }

    const result = await query.count('* as count').first();
    return Number((result as { count: string })?.count || 0);
  }

  async exists(conditions: Partial<T>): Promise<boolean> {
    const count = await this.count(conditions);
    return count > 0;
  }

  async increment(
    id: string,
    column: string,
    amount = 1,
    trx?: Transaction
  ): Promise<void> {
    const query = trx ? this.model.query(trx) : this.model.query();
    await query.findById(id).increment(column, amount);
  }

  async decrement(
    id: string,
    column: string,
    amount = 1,
    trx?: Transaction
  ): Promise<void> {
    const query = trx ? this.model.query(trx) : this.model.query();
    await query.findById(id).decrement(column, amount);
  }

  getQueryBuilder(): QueryBuilder<Model, Model[]> {
    return this.model.query();
  }
}
