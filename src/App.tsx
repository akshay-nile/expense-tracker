import { useEffect, useState } from 'react';
import { formatLongDate, formatLongMonth, formatRupee, formatShortMonth } from './services/utilities';
import useCurrentDate from './custom-hooks/useCurrentDate';
import { getExpenses } from './services/expenses';
import type { TreeNode } from 'primereact/treenode';
import { TreeTable } from 'primereact/treetable';
import { Column } from 'primereact/column';

function App() {
  const currentDate = useCurrentDate();
  const [nodes, setNodes] = useState<TreeNode[]>([]);
  const [expanding, setExpanding] = useState(false);
  const [expandedKeys, setExpandedKeys] = useState<{ [key: string]: boolean }>({});

  useEffect(() => { loadYears(); }, []);

  function loadYears() {
    setExpanding(true);
    getExpenses().then(data => {
      const years = data.map(year => ({
        key: `/${year.year}`,
        data: { label: year.year, total: formatRupee(year.total) },
        leaf: false
      }));
      setNodes(years);
    }).finally(() => setExpanding(false));
  }

  function loadMonths(yearNode: TreeNode) {
    const yearKey = yearNode.key as string;
    setExpanding(true);
    getExpenses(yearKey).then(data => {
      const months = data.map(month => ({
        key: `${yearKey}/${month.month}`,
        data: { label: formatLongMonth(month.month as string), total: formatRupee(month.total) },
        leaf: false
      }));
      yearNode.children = months;
      setNodes(prev => [...prev]);
    }).finally(() => setExpanding(false));
  }

  function loadDays(monthNode: TreeNode) {
    const monthKey = monthNode.key as string;
    setExpanding(true);
    getExpenses(monthKey).then(data => {
      const month = formatShortMonth(monthKey.split('/')[2]);
      const days = data.map(day => ({
        key: `${monthKey}/${day.day}`,
        data: { label: `${day.day} ${month}`, total: formatRupee(day.total) },
        leaf: false
      }));
      monthNode.children = days;
      setNodes(prev => [...prev]);
    }).finally(() => setExpanding(false));
  }

  function expandOrCollapseNode(node: TreeNode) {
    const nodeKey = node.key as string;
    if (nodeKey in expandedKeys) {
      delete node.children; // unload all the children
      Object.keys(expandedKeys).forEach(expandedKey => {  // collapse child's expanded keys
        if (expandedKey.startsWith(nodeKey)) delete expandedKeys[expandedKey];
      });
      setExpandedKeys({ ...expandedKeys });
    }
    else {
      const slashCounts = (node.key as string).split('/').length - 1;
      if (slashCounts === 1) loadMonths(node);
      else if (slashCounts === 2) loadDays(node);
      else if (slashCounts === 3) console.warn(node.key);
      setExpandedKeys({ ...expandedKeys, [nodeKey]: true });
    }
  }

  return (
    <div className="d-flex flex-column">
      <div className="text-bold text-center m-5 text-lg">
        {formatLongDate(currentDate)}
      </div>

      <div className="card m-2 mt-5">
        <TreeTable value={nodes} loading={expanding} className="w-full"
          emptyMessage={<div className='text-center'>No Expenses Found</div>}
          onExpand={event => expandOrCollapseNode(event.node)}
          onCollapse={event => expandOrCollapseNode(event.node)}
          onRowClick={event => expandOrCollapseNode(event.node)}
          expandedKeys={expandedKeys} onToggle={event => setExpandedKeys(event.value)}>

          <Column field="label" header="Years" className="text-left" expander />

          <Column field="total" header="Total Expense" className="text-right" />

        </TreeTable>
      </div>
    </div >
  );
};

export default App;
