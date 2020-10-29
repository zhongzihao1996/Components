<template>
  <div class="table-demo-container">
    <table-box
      :data="showData"
      rowKey="id"
      :tableHeight="500"
      :classNameConfig="classNameConfig"
      :mergeCellConfig="mergeCellConfig"
      :default-sort="{ prop: 'playerNum', rule: 'desc' }"
      :loadingFlag="loadingFlag"
      ref="table">
      <table-column
        type="select"
        keepSelectionFlag
        fixed="left" 
        :width="60">
      </table-column>
      <table-column
        prop="date"
        label="新增日期"
        :width="100"
        fixed="left"
        alignType="left"
        filterPlacement="h"
        sortable>
      </table-column>
      <table-column
        prop="way"
        label="玩家名字"
        :formatter="formatter"
        bgColorType="highlight"
        alignType="left">
      </table-column>
      <table-column
        prop="playerNum"
        label="玩家数"
        alignType="left"
        filterPlacement="hover提示内容hover提示内容hover提示内容hover提示内容hover提示内容hover提示内容hover提示内容hover提示内容"
        sortable>
      </table-column>
      <table-column label="至今">
          <table-column
            label="回本金额"
            alignType="right"><span>{{Number.parseInt(Math.random()*100)}}</span></table-column>
          <table-column
            label="回本率"
            alignType="right"><span>{{Number.parseInt(Math.random()*100)}}</span></table-column>
      </table-column>
      <table-column label="1日">
          <table-column
            label="回本金额"
            alignType="right"><span>{{Number.parseInt(Math.random()*100)}}</span></table-column>
          <table-column
            label="回本率"
            alignType="right"><span>{{Number.parseInt(Math.random()*100)}}</span></table-column>
      </table-column>
      <table-column label="2日">
          <table-column
            label="回本金额"
            alignType="right"><span>{{Number.parseInt(Math.random()*100)}}</span></table-column>
          <table-column
            label="回本率"
            alignType="right"><span>{{Number.parseInt(Math.random()*100)}}</span></table-column>
      </table-column>
      <table-column label="3日">
          <table-column
            label="回本金额"
            alignType="right"><span>{{Number.parseInt(Math.random()*100)}}</span></table-column>
          <table-column
            label="回本率"
            alignType="right"><span>{{Number.parseInt(Math.random()*100)}}</span></table-column>
      </table-column>
      <table-column
        prop="address"
        :width="180"
        :maxLength='10'
        label="地址"
        filterPlacement="hover提示内容hover提示内容hover提示内容hover提示内容">
      </table-column>
      <table-column
        label="操作"
        :width="100"
        fixed="right">
        <template slot-scope="scope">
          <a style="color:#108ee9;cursor:pointer;" @click="checkDate(scope.row)">查看日期</a>
        </template>
      </table-column>
    </table-box>
    <pagination @currentChange="handleCurrentChange"
                      :currentPage.sync="currentPage"
                      :pageSize.sync="pageSize"
                      :pageSizeConfig="pageSizeConfig"
                      @sizeChange="handleSizeChange"
                      :total="dataList.length"
                      :paginationNum="9">
    </pagination>
    
    <!-- 展开行demo（自定义内容或嵌套的表格行数据） -->
    <!-- <table-box
      :data="dataList2"
      rowKey="id"
      rowKey2="name"
      lazyLoad
      :loadFun="loadFun"
      :tableHeight="500"
      noTableBorderY
      :loadingFlag="loadingFlag"
      ref="table">
      <table-column fixed="left" type="expand">
        <template slot-scope="scope">
          <p>{{scope.rowIndex}}</p>
          <p>{{scope.row}}</p>
        </template>
      </table-column>
      <table-column
        prop="date"
        label="日期"
        sortable
        :width="180">
      </table-column>
      <table-column
        prop="name"
        label="姓名"
        sortable
        :width="180">
      </table-column>
      <table-column
        prop="address"
        label="地址">
      </table-column>
    </table-box> -->

  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import { Random } from 'mockjs';
// eslint-disable-next-line no-unused-vars
import { TableColumn, TableBox } from '../types';

interface TableData1 {
  date: string;
  way: string;
  playerNum: number;
  address: string;
}

interface TableData2 {
  id?: number;
  date: string;
  name: string;
  address: string;
  children?: Array<TableData2>;
  lazyChildFlag?: boolean;
}

interface configParam {
  row: TableData1;
  column: TableColumn;
  rowIndex: number;
  columnIndex: number;
}

@Component
export default class DemoPage extends Vue {
  $refs!: {
    table: any;
  };

  // data
  loadingFlag: boolean = false;
  dataList: TableData1[] = []; // 普通数据
  dataList2: TableData2[] = []; // 行展开数据
  pageSize: number = 20; // 默认每页数据量
  pageSizeConfig: Array<number> = [10, 20, 50, 100, 200, 500]; // 每页显示个数选择器的选项配置
  currentPage: number = 1; // 默认显示第一页

  get showData() {
    return this.dataList.slice((this.currentPage-1)*this.pageSize,this.currentPage*this.pageSize)
  }

  mounted() {
    this.getData();
  }

  // 获取数据
  getData() {
    let that = this;
    that.loadingFlag = true;
    let list: any[] = [];
    // 普通数据
    for (let i = 0; i < 100; i++) {
      list.push({
        id: i,
        date: Random.date(),
        way: Random.cname(),
        playerNum: Random.integer(100, 999999),
        address: Random.region() + Random.province() + Random.city()
      });
    }
    that.dataList = list;
    // 展开行数据
    that.dataList2 = [
      {
        id: 1,
        date: '2020-01-00',
        name: '张小明',
        address: '上海市普陀区金沙江路 1518 弄'
      },
      {
        id: 2,
        date: '2020-02-00',
        name: '张小明',
        address: '上海市普陀区金沙江路 1517 弄'
      }, {
        id: 3,
        date: '2020-03-00',
        name: '张小明',
        address: '上海市普陀区金沙江路 1519 弄',
        children: [
          {
            id: 31,
            date: '2016-03-01',
            name: '张小明',
            address: '上海市普陀区金沙江路 1519 弄',
            children: [
              {
                date: '2016-05-01',
                name: '张小明311',
                address: '上海市普陀区金沙江路 1519 弄'
              },
              {
                date: '2016-05-01',
                name: '张小明312',
                address: '上海市普陀区金沙江路 1519 弄'
              }
            ]
          }, 
          {
            id: 32,
            date: '2016-03-02',
            name: '张小明',
            address: '上海市普陀区金沙江路 1519 弄'
          }
        ]
      },
      {
        id: 4,
        date: '2020-04-00',
        name: '张小明',
        address: '上海市普陀区金沙江路 1516 弄',
        lazyChildFlag: true
      }
    ];
    that.loadingFlag = false;
  }

  // 合并单元格
  mergeCellConfig({row, column, rowIndex, columnIndex}: configParam) {
    if (row.date && rowIndex === 1) {
      if (column.prop === 'date' && columnIndex === 1) {
        return {
          rowspan: 1,
          colspan: 2
        };
      } else if (columnIndex === 2) {
        return {
          rowspan: 0,
          colspan: 0
        };
      }
    }
    // if (columnIndex === 1) {
    //   if (rowIndex % 2 === 0) {
    //     return {
    //       rowspan: 2,
    //       colspan: 1
    //     };
    //   } else {
    //     return {
    //       rowspan: 0,
    //       colspan: 0
    //     };
    //   }
    // }
  }
  
  // 自定义配置类名
  classNameConfig({rowIndex, columnIndex, row, column}: configParam) {
    if(rowIndex === 1) {
      return 'bold';
    }
    if(columnIndex === 2) {
      return 'bold';
    }
    if(row.address.length > 10 && column.prop === 'address') {
      return 'bold';
    }
  }
  
  // 自定义格式化单元格内容
  formatter(row: TableData1, column: TableColumn, value: any, rowIndex: number) {
    return `${rowIndex}-${value}`;
  }

  handleCurrentChange(val: number) {
    this.currentPage = val; // 如已绑定.sync修饰符，可不需手动更新
    console.log(`当前页: ${val}`);
    this.$refs.table.$refs.bodyWrapperDom.scrollTop = 0;
  }

  handleSizeChange(val: number) {
    this.pageSize = val;  // 如已绑定.sync修饰符，可不需手动更新
    console.log(`每页 ${val} 条`);
    this.$refs.table.$refs.bodyWrapperDom.scrollTop = 0;
  }

  checkDate(row: TableData1): void {
    alert(row.date);
  }

  loadFun(row: object, nestedNode: any, resolve: Function) {
    setTimeout(() => {
      resolve([
        {
          date: '2016-04-01',
          name: '张小明41',
          address: '上海市普陀区金沙江路 1519 弄'
        }, {
          date: '2016-04-02',
          name: '张小明42',
          address: '上海市普陀区金沙江路 1519 弄'
        }
      ])
    }, 1000)
  }
}
</script>

<style lang="scss" scoped>
.table-demo-container {
  padding: 10px;
  box-shadow: 0 0 5px #cecece;
  background: #fff;
  border-radius: 6px;
}
/deep/ .bold {
  font-weight: bold;
}
</style>
