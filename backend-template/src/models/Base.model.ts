import { Model, ModelOptions, QueryContext } from 'objection';

export class BaseModel extends Model {
  id!: string;
  created_at!: Date;
  updated_at!: Date;

  static get modelPaths() {
    return [__dirname];
  }

  $beforeInsert(queryContext: QueryContext) {
    this.created_at = new Date();
    this.updated_at = new Date();
  }

  $beforeUpdate(opt: ModelOptions, queryContext: QueryContext) {
    this.updated_at = new Date();
  }

  $formatJson(json: Record<string, unknown>) {
    json = super.$formatJson(json);
    return json;
  }
}
