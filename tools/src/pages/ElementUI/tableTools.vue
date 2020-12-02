<template>
    <div>
        <button @click="exportExcelSelect">按勾选导出</button>
        <button @click="exportExcel">按查询结果导出</button>
        <export-excel-common 
            ref="myChild" 
            :exportExcelInfo="exportExcelInfo" 
            :exportExcelArry="exportExcelArry"
            :tableData="tableAllData" ></export-excel-common>
    </div>
</template>
<script>
import exportExcelCommon from '@/components/ElementUI/Export/ExportExcelCommon';
export default {
    components: {
        exportExcelCommon
    },
    data() {
        return {
            //导出excel表格id及excel名称
            exportExcelInfo: {
                excelId: 'record-table',
                excelName: '表格.xlsx'
            },
            //导出表格字段及formatter信息
            exportExcelArry: [{
                prop: 'phoneNumber',
                label: '用户手机号',
                formatterFlag: false
            },{
                prop: 'name',
                label: '任务名称',
                formatterFlag: false
            },{
                prop: 'status',
                label: '状态',
                formatterFlag: true,
                formatterType: 'common-type',
                formatterInfo: [{value: 0,label: '未完成'},{value: 1,label: '已完成'}]
            }],
            //需要导出的table数据
            tableAllData: [{
                phoneNumber: '111222333',
                name: '任务一',
                status: 1
            },{
                phoneNumber: '222333444',
                name: '任务二',
                status: 0
            }],
        }
    },
    methods: {
        exportExcelSelect () {
            if(this.selectListArry.length == 0){
                global.message('请勾选操作项')
                return;
            }
            //将选中项传给this. tableAllData
            this.tableAllData = this.selectListArry
            //需要延时调导出方法，为了等待数据初始化到列表中
            setTimeout(()=>{
                this.$refs.myChild.exportExcel();
            },500)
        },
        exportExcel () {
            setTimeout(()=>{
                this.$refs.myChild.exportExcel();
            },500)
            //获取到表格数据的值并赋给this.tableAllData
            //同样延时调导出方法，需在initData('export-excel')方法执行成功后调this.$refs.myChild.exportExcel();方法
        }
    },
}
</script>