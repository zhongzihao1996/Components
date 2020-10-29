import Vue from 'vue';
import * as TableComponent from './table-component';

export const version: string

export function install(vue: typeof Vue): void

export { TableComponent }

export * from './table-component';
export * from './pagination';
export * from './date-picker';
export * from './pop-dialog';
export * from './multi-select';
export * from './customize-filter';
