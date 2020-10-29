import Vue from 'vue'

export declare class Pagination extends Vue {

  static install(vue: typeof Vue): void

  disabled: boolean

  total: number

  pageSize: number
  
  currentPage: number

  paginationNum: number

  pageSizeConfig: number[]

}