import { injectable } from 'tsyringe';
import { BaseRepository } from './base.repo';
import { Permission } from '@/models/Permission.model';

@injectable()
export class PermissionRepository extends BaseRepository<Permission> {
  constructor() {
    super(Permission);
  }

  async findBySlug(slug: string): Promise<Permission | undefined> {
    return Permission.query().where('slug', slug).first();
  }

  async findByModule(module: string): Promise<Permission[]> {
    return Permission.query().where('module', module).orderBy('name', 'asc');
  }

  async findBySlugs(slugs: string[]): Promise<Permission[]> {
    return Permission.query().whereIn('slug', slugs);
  }

  async findByIds(ids: string[]): Promise<Permission[]> {
    return Permission.query().whereIn('id', ids);
  }

  async getAllGroupedByModule(): Promise<Record<string, Permission[]>> {
    const permissions = await Permission.query().orderBy('module').orderBy('name');

    return permissions.reduce((acc, permission) => {
      if (!acc[permission.module]) {
        acc[permission.module] = [];
      }
      acc[permission.module].push(permission);
      return acc;
    }, {} as Record<string, Permission[]>);
  }
}
