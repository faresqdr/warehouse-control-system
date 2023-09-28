import { createRouter, createWebHistory } from 'vue-router'
//Home
import Dashboard from '@/views/dashboard/DashboardView.vue'

// ***** STOCK ***** //
import Stock from '@/views/stock/StockView.vue'

// Operations
import Operations from '@/views/stock/operations/OperationsView.vue'
import OperationsMenu from '@/views/stock/operations/OperationsMenu.vue'
import AdjustStock from '@/views/stock/operations/adjust-stock/AdjustStockView.vue'
import EmployeeOrder from '@/views/stock/operations/employee-order/EmployeeOrderView.vue'
import WarehouseTransfer from '@/views/stock/operations/warehouse-transfer/WarehouseTransferView.vue'
// Warehouses
import Warehouses from '@/views/stock/warehouses/WarehousesView.vue'
import WarehousesList from '@/views/stock/warehouses/components/WarehousesList.vue'
import WarehouseView from '@/views/stock/warehouses/warehouse/WarehouseView.vue'
// ***** END  STOCK ***** //
//Fleet
import Fleet from '@/views/fleet/FleetView.vue'

const routes = [
    {
        path: '/',
        name: 'dashboard',
        redirect: { name: 'stock' },
        component: Dashboard,
    },
    {
        path: '/stock',
        name: 'stock',
        component: Stock,
        redirect: { name: 'operations' },
        children: [
            {
                path: 'operations', name: 'operations', component: Operations, redirect: { name: 'operations.default' }, children: [
                    { path: '', name: 'operations.default', component: OperationsMenu },
                    { path: 'adjust', name: 'adjust-stock', component: AdjustStock },
                    { path: 'employee-order', name: 'employee-order', component: EmployeeOrder },
                    { path: 'transfer', name: 'warehouse-transfer', component: WarehouseTransfer },
                ]
            },
            {
                path: 'warehouses', name: 'warehouses', component: Warehouses, redirect: { name: "warehouses.list" }, children: [
                    { path: '', name: 'warehouses.list', component: WarehousesList },
                    {
                        path: ':warehouse_id', name: 'warehouse', component: WarehouseView
                    },
                ]
            }
        ]
    },
    {
        path: '/fleet',
        name: 'fleet',
        component: Fleet,
    }
];

const router = createRouter({
    history: createWebHistory(),
    routes,
})
export default router