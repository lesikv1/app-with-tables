import React, { useContext, useEffect, useRef, useState } from 'react';
import axios from 'axios';
import type { InputRef } from 'antd';
import {url} from '../../url';
import { Button, Form, Input, Popconfirm, Table } from 'antd';
import type { FormInstance } from 'antd/es/form';
import styles from './Cars.module.css';

const EditableContext = React.createContext<FormInstance<any> | null>(null);

interface Item {
  key?: any;
  id: string;
  sellerId: string;
  carId: string;
  totalPrice: number;
}

interface EditableRowProps {
  index: number;
}

const EditableRow: React.FC<EditableRowProps> = ({ index, ...props }) => {
  const [form] = Form.useForm();
  return (
    <Form form={form} component={false}>
      <EditableContext.Provider value={form}>
        <tr {...props} />
      </EditableContext.Provider>
    </Form>
  );
};

interface EditableCellProps {
  title: React.ReactNode;
  editable: boolean;
  children: React.ReactNode;
  dataIndex: keyof Item;
  record: Item;
  handleSave: (record: Item) => void;
}

const EditableCell: React.FC<EditableCellProps> = ({
                                                     title,
                                                     editable,
                                                     children,
                                                     dataIndex,
                                                     record,
                                                     handleSave,
                                                     ...restProps
                                                   }) => {
  const [editing, setEditing] = useState(false);
  const inputRef = useRef<InputRef>(null);
  const form = useContext(EditableContext)!;

  useEffect(() => {
    if (editing) {
      inputRef.current!.focus();
    }
  }, [editing]);

  const updateCar = (card: Item) => {
    const newCard = {
      id: card.id,
      sellerId: card.sellerId,
      carId: card.carId,
      totalPrice: card.totalPrice,
    }

    axios.post(url + 'sale-reports', newCard)
      .then(res => {
        console.log(res, 'update success')
      })
      .catch(e => {
        console.log(e, 'error update')
      })
  }

  const toggleEdit = () => {
    setEditing(!editing);
    console.log(record, 'toggleEdit---')
    form.setFieldsValue({ [dataIndex]: record[dataIndex] });
  };

  const save = async () => {
    try {
      const values = await form.validateFields();

      console.log(record, 'save---')
      console.log(values, 'values---')
      toggleEdit();
      updateCar({ ...record, ...values })
      handleSave({ ...record, ...values });
    } catch (errInfo) {
      console.log('Save failed:', errInfo);
    }
  };

  let childNode = children;

  if (editable) {
    childNode = editing ? (
      <Form.Item
        style={{ margin: 0 }}
        name={dataIndex}
        rules={[
          {
            required: true,
            message: `${title} is required.`,
          },
        ]}
      >
        <Input ref={inputRef} onPressEnter={save} onBlur={save} />
      </Form.Item>
    ) : (
      <div className="editable-cell-value-wrap" style={{ paddingRight: 24 }} onClick={toggleEdit}>
        {children}
      </div>
    );
  }

  return <td {...restProps}>{childNode}</td>;
};

type EditableTableProps = Parameters<typeof Table>[0];

interface DataType {
  key: React.Key;
  id: string;
  sellerId: string;
  carId: string;
  totalPrice: number;
}

type ColumnTypes = Exclude<EditableTableProps['columns'], undefined>;

export const SaleReport: React.FC = () => {
  const [dataSource, setDataSource] = useState<DataType[]>([
    {
      id: '0',
      key: '1',
      sellerId: '234235',
      carId: '234324235',
      totalPrice: 25500,
    },
    {
      id: '1',
      key: '2',
      sellerId: '2342354242',
      carId: '2343242323',
      totalPrice: 25300,
    },
  ]);

  const [newSellerId, setNewSellerId] = useState<string>('');
  const [newCarId, setNewCarId] = useState<string>('');
  const [newTotalPrice, setNewTotalPrice] = useState<number>(0);

  useEffect(() => {
    axios.get(url + 'sale-reports').then(res => {
      console.log(res, 'ress')
      setDataSource(res.data)
    })
      .catch(e => {
        console.log(e, 'error get')
      })
  })

  const [count, setCount] = useState(2);

  // console.log(dataSource, 'dataSource-');

  const handleDelete = (key: React.Key) => {
    const newData = dataSource.filter((item) => item.key !== key);
    setDataSource(newData);
  };

  const deleteOnServer = (id: string) => {
    axios.delete(url + 'sale-reports/' + id)
      .then(res => {
        console.log(res, 'success deleted')
      })
      .catch(e => {
        console.log(e, 'error with deleting')
      })
  }

  const defaultColumns: (ColumnTypes[number] & { editable?: boolean; dataIndex: string })[] = [
    {
      title: 'id',
      dataIndex: 'id',
    },
    {
      title: 'sellerId',
      dataIndex: 'sellerId',
      width: '30%',
      editable: true,
    },
    {
      title: 'carId',
      dataIndex: 'carId',
      editable: true,
    },
    {
      title: 'totalPrice',
      dataIndex: 'totalPrice',
      editable: true,
    },
    {
      title: 'operation',
      dataIndex: 'operation',
      render: (a, record: any) =>
        dataSource.length >= 1 ? (
          <Popconfirm title="Sure to delete?" onConfirm={() => {
            handleDelete(record.key)
            deleteOnServer(record.id)
          }}>
            <a>Delete</a>
          </Popconfirm>
        ) : null,
    },
  ];

  const addToServer = () => {
    axios.post(url + 'sale-reports', {
      sellerId: newSellerId,
      carId: newCarId,
      totalPrice: newTotalPrice,
    })
      .then(res => {
        console.log('success added')
      })
      .catch(e => {
        console.log('error with edding')
      })
  }

  const handleAdd = () => {
    const newData: DataType = {
      key: count,
      id: count + '',
      sellerId: newSellerId,
      carId: newCarId,
      totalPrice: newTotalPrice,
    };
    addToServer();
    setDataSource([...dataSource, newData]);
    setCount(count + 1);
  };

  const handleSave = (row: DataType) => {
    const newData = [...dataSource];
    const index = newData.findIndex((item) => row.key === item.key);
    const item = newData[index];
    newData.splice(index, 1, {
      ...item,
      ...row,
    });
    setDataSource(newData);
  };

  const components = {
    body: {
      row: EditableRow,
      cell: EditableCell,
    },
  };

  const columns = defaultColumns.map((col) => {
    if (!col.editable) {
      return col;
    }
    return {
      ...col,
      onCell: (record: DataType) => ({
        record,
        editable: col.editable,
        dataIndex: col.dataIndex,
        title: col.title,
        handleSave,
      }),
    };
  });


  return (
    <div>
      <p className={'label'}>sale-reports</p>
      <Button onClick={handleAdd} type="primary" style={{ marginBottom: 16 }}>
        Add a row
      </Button>
      <div className={styles.xRow}>
        <Input placeholder={'sellerId'} value={newSellerId} onChange={(event) => setNewSellerId(event.target.value)} />
        <Input placeholder={'carId'} value={newCarId} onChange={(event) => setNewCarId(event.target.value)} />
        <Input placeholder={'total price'} value={newTotalPrice} onChange={(event) => setNewTotalPrice(+event.target.value || 1)} />
      </div>
      <Table
        components={components}
        rowClassName={() => 'editable-row'}
        bordered
        dataSource={dataSource}
        columns={columns as ColumnTypes}
      />
    </div>
  );
};
