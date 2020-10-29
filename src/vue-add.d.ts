// eslint-disable-next-line no-unused-vars
import { ElMessage } from 'element-ui/types/message';

declare module 'vue/types/vue' {
  interface Vue {
    $message: ElMessage;
  }
}