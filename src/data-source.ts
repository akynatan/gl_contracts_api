import {
  DataSource,
  DataSourceOptions,
  NamingStrategyInterface,
  DefaultNamingStrategy,
} from 'typeorm';
import { pluralize } from 'inflection';
import configorm from './ormconfig.json'

class CustomNamingStrategy
  extends DefaultNamingStrategy
  implements NamingStrategyInterface
{
  joinColumnName(relationName: string, referencedColumnName?: string): string {
    return `${relationName.replace(/([A-Z])/g, '_$1').toLowerCase()}_${referencedColumnName || 'id'}`;
  }

  columnName(propertyName: string, customName: string): string {
    return customName || propertyName.replace(/([A-Z])/g, '_$1').toLowerCase();
  }

  tableName(targetName: string, userSpecifiedName: string): string {
    return pluralize(super.tableName(targetName, userSpecifiedName));
  }
}

const options: DataSourceOptions = {
  type: 'postgres',
  ...configorm,
  synchronize: false,
  logging: process.env.DATABASE_LOGGING
    ? process.env.DATABASE_LOGGING === 'true'
    : true,
  entities: [__dirname + '/entities/*{.ts,.js}'],
  migrations: [__dirname + '/db/migrations/*{.ts,.js}'],
  subscribers: [],
  namingStrategy: new CustomNamingStrategy(),
};

const dataSource = new DataSource(options);
dataSource.initialize()

export const AppDataSource = dataSource;
