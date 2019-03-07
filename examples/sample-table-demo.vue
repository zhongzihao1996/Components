<template>
  <div class="container">
    <h3>sample-table</h3>
    <sample-table :data="list" fixedable width="2000">
      <sample-table-header slot="header">
        <sample-table-header-column label="姓名" filteable prop="name" />
        <sample-table-header-column label="日期" sortable prop="date" fixed="left" />
        <sample-table-header-column v-for="item in 30" :key="item" :label="'第'+item+'天'" />
        <sample-table-header-column label="地址" />
        <sample-table-header-column label="操作" fixed="right" :width="120" />
      </sample-table-header>
      <sample-table-body slot-scope="scope" :row="scope.row" :index="scope.index" slot="body">
        <sample-table-body-column prop="name" />
        <sample-table-body-column prop="date" fixed="left" />
        <sample-table-body-column v-for="item in 30" :key="item">{{Number.parseInt(Math.random()*100)}}</sample-table-body-column>
        <sample-table-body-column prop="address" />
        <sample-table-body-column fixed="right">
          <a style="color:#108ee9;cursor:pointer;" @click="test(scope.row)">查看</a>
        </sample-table-body-column>
      </sample-table-body>
    </sample-table>
  </div>
</template>

<script>
import Mockjs from 'mockjs';
const Random = Mockjs.Random;
export default {
  data() {
    return {
      a: '',
      list: []
    };
  },
  mounted() {
    let list = [];
    for (let i = 0; i < 20; i++) {
      list.push({
        date: Random.date(),
        name: Random.cname(),
        address: Random.region() + Random.province() + Random.city()
      });
    }
    this.list = list;
  },
  methods: {
    test(record) {
      console.log(record);
      this.$message.info(record.date);
    }
  }
};
</script>



