/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
/**
 *
 * CorporateListComponent
 *
 */

import React, { useEffect, useState, useRef } from 'react';
// import PropTypes from 'prop-types';
import styled from 'styled-components';
import { Row, Table, Input, Modal } from 'antd';
import Icon, { CloseOutlined } from '@ant-design/icons';
import { Colors } from 'theme/colors';
import axiosInstance, { createFormData } from 'services';
import Resizer from 'react-image-file-resizer';
import { Images } from 'images/index';
import ConfirmationPopupComponent from 'components/ConfirmationPopupComponent';
import PrimaryButtonComponent from 'components/PrimaryButtonComponent';
import TextInputComponent from 'components/TextInputComponent';

const List = styled(Table)`
  table,
  tr,
  tbody,
  td,
  thead,
  th {
    color: ${Colors.white} !important;
    background-color: ${Colors.background} !important;
    border-color: transparent !important;
  }

  tr:not(:nth-child(1)) {
    > td {
      border-top: 2px solid ${Colors.bodyText} !important;
    }
  }

  thead,
  th {
    border-bottom: 2px solid ${Colors.bodyText} !important;
    font-weight: bold !important;
    font-family: Montserrat-Bold !important;
  }

  .ant-pagination-item-link,
  .ant-table-pagination.ant-pagination {
    color: ${Colors.white};
    margin-bottom: 30px;

    input {
      background-color: ${Colors.background} !important;
    }
  }

  .ant-table-sticky-header {
    top: 148px !important;
  }

  .ant-empty-description {
    color: ${Colors.white};
  }

  .ant-typography.ant-typography-disabled {
    color: ${Colors.grey} !important;
  }

  .ant-table-row-expand-icon {
    background-color: transparent !important;
  }

  .ant-table-expanded-row {
    td,
    th {
      color: #8dbbe0 !important;
    }

    .action {
      color: ${Colors.warning} !important;
      cursor: pointer;
    }
  }
`;

const SearchBar = styled(Row)`
  position: relative;

  input {
    background-color: transparent !important;
    border: none;
    color: ${Colors.white};
  }

  .ant-input-group-addon {
    background-color: transparent !important;
    border: none;
  }
`;

const PopupModel = styled(Modal)`
  background-color: ${Colors.background};
  border-radius: 8px;
  padding: 20px 0px 5px;
  color: ${Colors.white};
  overflow: hidden;
  margin: 20px 0px;

  > div {
    background-color: ${Colors.background};
  }

  > .ant-modal-content {
    box-shadow: none;
    padding: 0px 40px;

    > button {
      color: ${Colors.white};
      top: -25px;
      right: 0px;
    }
  }

  .ant-modal-body {
    padding: 24px 0px;
  }
`;

const ImageUploadSection = styled(Row)`
  position: relative;

  > img {
    height: 250px;
    width: 434px;
    object-fit: contain;
    border-radius: 8px;
    border: 2px solid white;
  }
`;

const UpdateIcon = styled.div`
  background-color: ${Colors.primary};
  height: 56px;
  width: 56px;
  border-radius: 50px;
  position: absolute;
  bottom: 15px;
  right: 20px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;

  > img {
    height: 25px;
    width: 25px;
  }
`;

const UploadPicSection = styled(Row)`
  background-color: ${Colors.shadow};
  height: 200px;
  width: 434px;
  border-radius: 8px;
  border: 2px solid ${Colors.white};
  flex-direction: column;
`;

const UploadIcon = styled.div`
  background-color: ${Colors.primary};
  height: 56px;
  width: 56px;
  border-radius: 50px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;

  > img {
    height: 32px;
    width: 32px;
  }
`;

function CorporateListComponent() {
  const corporateColumns = [
    {
      title: 'ID',
      dataIndex: 'corporateId',
      align: 'center',
      width: 90,
      key: 'corporateId',
    },
    {
      title: 'Corporate Logo',
      dataIndex: 'logo',
      key: 'logo',
      render: (_, record) =>
        record.logo ? (
          <img
            src={`${process.env.IMAGE_URL_PREFIX}corporate/${
              record.corporateId
            }/${record.logo}`}
            alt="corporate"
            style={{ height: '68px', width: '130px', objectFit: 'contain' }}
          />
        ) : (
          '-'
        ),
    },
    {
      title: 'Name',
      dataIndex: 'corporateName',
      key: 'corporateName',
    },
    {
      title: 'Action',
      dataIndex: 'action',
      render: (_, record) => (
        <Row>
          <div
            onClick={() => {
              const data = corporateList.find(
                t => t.corporateId === record.corporateId,
              );
              setSelectedCorporate(data);
            }}
            style={{ color: Colors.primary, cursor: 'pointer' }}
          >
            Edit
          </div>
          <div
            onClick={() => {
              setDeleteModalVisible(true);
              setSelectedDeleteCorporate(record.corporateId);
            }}
            style={{ color: Colors.primary, cursor: 'pointer', marginLeft: 15 }}
          >
            Delete
          </div>
        </Row>
      ),
    },
  ];

  const [corporateList, setCorporateList] = useState([]);
  const [customPagination, setCustomPagination] = useState({
    current: 1,
    pageSize: 200,
    showSizeChanger: false,
    simple: true,
  });
  const [keyword, setKeyword] = useState('');

  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [updateModalVisible, setUpdateModalVisible] = useState(false);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [selectedCorporate, setSelectedCorporate] = useState(null);
  const [selectedDeleteCorporate, setSelectedDeleteCorporate] = useState(null);

  // for clean up unmount
  const unmounted = useRef(false);

  useEffect(() => {
    getList(1);

    return () => {
      unmounted.current = true;
    };
  }, []);

  const getList = (page, search = '') => {
    axiosInstance
      .get(`api/corporate?page=${page}&search=${search}`)
      .then(res => {
        if (!unmounted.current) {
          const details = res.data.data;
          const newList = details.map(d => ({
            key: d.corporate_id,
            corporateId: d.corporate_id,
            logo: d.logo_filename,
            corporateName: d.business_name,
          }));
          setCorporateList(newList);

          setCustomPagination({
            ...customPagination,
            current: page,
            total: res.data.total,
          });
        }
      });
  };

  const handleTableChange = pagination => {
    window.scrollTo(0, 0);
    getList(pagination.current, keyword.trim());
  };

  useEffect(() => {
    if (selectedCorporate) {
      setUpdateModalVisible(true);
    }
  }, [selectedCorporate]);

  const updateCorporateList = (action, data = null) => {
    if (action === 'update' && data) {
      const newData = {
        corporateId: data.corporate_id,
        corporateName: data.business_name,
        logo: data.logo_filename,
      };
      const newList = [...corporateList];
      const index = newList.findIndex(item => item.key === data.corporate_id);
      const item = newList[index];
      newList.splice(index, 1, {
        ...item,
        ...newData,
      });
      setCorporateList(newList);
    } else {
      getList(1, '');
    }
  };

  const deleteCorporate = () => {
    axiosInstance
      .delete(`api/corporate/${selectedDeleteCorporate}`)
      .then(() => {
        setDeleteModalVisible(false);
        getList(customPagination.current, keyword);
      });
  };

  const CorporateForm = ({ visibility, dismissModal, action }) => {
    const [name, setName] = useState('');
    const [image, setImage] = useState('');
    const [tempFile, setTempFile] = useState(null);
    const [tempPic, setTempPic] = useState(null);

    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
      if (visibility) {
        if (selectedCorporate) {
          setName(selectedCorporate.corporateName);
          setImage(selectedCorporate.logo);
        }
      }
    }, [visibility]);

    const update = () => {
      if (!isLoading) {
        setIsLoading(true);
        const params =
          action === 'update'
            ? {
                corporate_id: selectedCorporate.corporateId,
                business_name: name,
                logo_filename: tempFile || null,
              }
            : {
                business_name: name,
                logo_filename: tempFile || null,
              };

        axiosInstance
          .post('api/corporate', createFormData(params))
          .then(res => {
            setIsLoading(false);

            updateCorporateList(action, res.data.data);
            dismissModal();
          })
          .catch(() => {
            setIsLoading(false);
          });
      }
    };

    const imageUpload = async e => {
      const file = e.target.files[0];
      const newFile = await resizeFile(file);
      setTempFile(newFile);
      setTempPic(URL.createObjectURL(newFile));
    };

    // resize image
    const resizeFile = file =>
      new Promise(resolve => {
        Resizer.imageFileResizer(
          file,
          612,
          428,
          'png',
          100,
          0,
          fileObj => {
            resolve(fileObj);
          },
          'file',
        );
      });

    return (
      <PopupModel
        centered
        maskClosable={false}
        visible={visibility}
        onCancel={dismissModal}
        style={{
          backgroundColor: Colors.background,
        }}
        footer={null}
      >
        {image || tempPic ? (
          <ImageUploadSection justify="center">
            <img
              src={
                tempPic ||
                `${process.env.IMAGE_URL_PREFIX}corporate/${
                  selectedCorporate.corporateId
                }/${image}`
              }
              alt="profile-pic"
            />
            <input
              accept="image/*"
              className="pic"
              id="pic"
              style={{ display: 'none' }}
              onChange={imageUpload}
              type="file"
            />
            <label htmlFor="pic">
              <UpdateIcon>
                <img src={Images.editIcon} alt="upload" />
              </UpdateIcon>
            </label>
          </ImageUploadSection>
        ) : (
          <UploadPicSection
            justify="center"
            align="middle"
            className="bodyBold"
          >
            <input
              accept="image/*"
              className="pic"
              id="pic"
              style={{ display: 'none' }}
              onChange={imageUpload}
              type="file"
            />
            <label htmlFor="pic">
              <UploadIcon>
                <img src={Images.camera} alt="upload" />
              </UploadIcon>
            </label>
          </UploadPicSection>
        )}

        <div style={{ marginTop: '20px' }}>
          <TextInputComponent
            title="Corporate Name"
            defaultValue={name}
            value={name}
            type="text"
            placeholder="Enter Corporate Name"
            onChange={value => {
              setName(value);
            }}
          />
        </div>

        <Row justify="center" style={{ width: '100%' }}>
          <PrimaryButtonComponent
            style={{
              margin: '10px 10px 0px',
            }}
            label={action[0].toUpperCase() + action.substring(1)}
            onClick={() => {
              update();
            }}
            disabled={!name || !name.trim().length}
            loading={isLoading}
            iconRight={false}
          />
          <PrimaryButtonComponent
            style={{
              margin: '10px 10px 0px',
            }}
            label="Cancel"
            onClick={dismissModal}
            iconRight={false}
          />
        </Row>
      </PopupModel>
    );
  };

  return (
    <div style={{ padding: '10px 20px 20px 10px' }}>
      <Row justify="space-between" style={{ flex: 1, marginBottom: '10px' }}>
        <SearchBar align="middle">
          <div>
            <Input
              className="bodyBold white-text"
              placeholder="Search Corporate"
              style={{ width: '250px' }}
              value={keyword}
              addonBefore={
                <Icon
                  onClick={() => {
                    getList(1, keyword);
                  }}
                  component={() => (
                    <img
                      src={Images.searchIcon}
                      style={{ height: '24px', width: '24px' }}
                      alt="search"
                    />
                  )}
                />
              }
              onPressEnter={() => {
                getList(1, keyword);
              }}
              onChange={e => {
                setKeyword(e.target.value);
              }}
            />
            {!!keyword && (
              <CloseOutlined
                style={{
                  fontSize: '20px',
                  marginLeft: '5px',
                  color: Colors.white,
                }}
                onClick={() => {
                  setKeyword('');
                  getList(1, '');
                }}
              />
            )}
          </div>
        </SearchBar>
        <PrimaryButtonComponent
          style={{
            padding: '0px 20px',
            marginiRght: '10px',
            marginTop: '5px',
            display: 'flex',
            justifyContent: 'center',
          }}
          label="Create Corporate"
          onClick={() => {
            setCreateModalVisible(true);
          }}
          iconRight={false}
        />
      </Row>
      <List
        size="middle"
        className="body white-text"
        columns={corporateColumns}
        dataSource={corporateList}
        sticky
        onChange={handleTableChange}
        pagination={customPagination}
        bordered={false}
      />
      {updateModalVisible || createModalVisible ? (
        <CorporateForm
          visibility={updateModalVisible || createModalVisible}
          dismissModal={() => {
            if (updateModalVisible) {
              setUpdateModalVisible(false);
              setSelectedCorporate(null);
            }

            if (createModalVisible) {
              setCreateModalVisible(false);
            }
          }}
          action={createModalVisible ? 'create' : 'update'}
        />
      ) : null}
      <ConfirmationPopupComponent
        visibility={deleteModalVisible}
        dismissModal={() => {
          setDeleteModalVisible(false);
          setSelectedDeleteCorporate(null);
        }}
        title="Delete Corporate"
        message="This action cannot be undone. Do you wish to delete this corporate?"
        leftAction={deleteCorporate}
        rightAction={() => {
          setDeleteModalVisible(false);
          setSelectedDeleteCorporate(null);
        }}
      />
    </div>
  );
}

CorporateListComponent.propTypes = {};

export default CorporateListComponent;
