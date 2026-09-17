#!/usr/bin/env -S node
import type { Contract as Start } from '../../snapshots/096e34299778ef2c7af49a7dd88e59409a7249012a6cb0e15d0da4687e7aa6d8/contract';
import startContract from '../../snapshots/096e34299778ef2c7af49a7dd88e59409a7249012a6cb0e15d0da4687e7aa6d8/contract.json' with { type: 'json' };
import type { Contract as End } from '../../snapshots/2c5a947216dd9582f5e1770e1044bfb1a49198f1661d5c43cc0e887a678921b8/contract';
import endContract from '../../snapshots/2c5a947216dd9582f5e1770e1044bfb1a49198f1661d5c43cc0e887a678921b8/contract.json' with { type: 'json' };
import { Migration, MigrationCLI } from '@prisma/orm-postgres/migration';

export default class M extends Migration<Start, End> {
  override readonly startContractJson = startContract;
  override readonly endContractJson = endContract;

  override get operations() {
    return [
      this.dropConstraint({
        schema: 'public',
        table: 'category',
        constraint: 'category_userId_name_key',
      }),
      this.createIndex({
        schema: 'public',
        table: 'category',
        index: 'category_userId_name_lower_key_a2fa32b8',
        expression: '"userId", lower(name)',
        extras: { unique: true },
      }),
    ];
  }
}

MigrationCLI.run(import.meta.url, M);
