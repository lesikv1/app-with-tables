import React, {useState} from 'react';
import { Dna } from  'react-loader-spinner';

import {Cars} from './Tabs/Cars';
import {Employees} from './Tabs/Employees';
import {SaleReport} from './Tabs/SaleReport';

import 'antd/dist/reset.css';
import './App.css';

const TAB_CARS = 'TAB_CARS';
const TAB_EMPLOY = 'TAB_EMPLOY';
const TAB_SALE_REPORT = 'TAB_SALE_REPORT'


function App() {
  const [tab, setTab] = useState<string>(TAB_CARS);
  const [load, setLoad] = useState<boolean>(false);

  return (
    <div className="App">
      <div className='header'>
        <p className={tab === TAB_CARS ? 'labelActive' : 'label'} onClick={() => setTab(TAB_CARS)}>Cars</p>
        <p className={tab === TAB_EMPLOY ? 'labelActive' : 'label'} onClick={() => setTab(TAB_EMPLOY)}>Employees</p>
        <p className={tab === TAB_SALE_REPORT ? 'labelActive' : 'label'} onClick={() => setTab(TAB_SALE_REPORT)}>Sale report</p>
      </div>
      {load ? (
        <Dna
          visible={true}
          height="200"
          width="200"
          ariaLabel="dna-loading"
          wrapperStyle={{}}
          wrapperClass="dna-wrapper"
        />
      ) : (
        <div className={'content'}>
          {tab === TAB_CARS && <Cars />}
          {tab === TAB_EMPLOY && <Employees />}
          {tab === TAB_SALE_REPORT && <SaleReport />}
        </div>
      )}
    </div>
  );
}

export default App;
