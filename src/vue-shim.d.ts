// 声明全局方法/变量
declare module '*.vue' {
  import Vue from 'vue';

  export default Vue;
}

declare module 'mockjs';
declare module 'normalize-wheel';

// eslint-disable-next-line no-unused-vars
declare const compVersion: string;
