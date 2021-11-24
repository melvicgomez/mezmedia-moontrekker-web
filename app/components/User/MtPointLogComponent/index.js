/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
/**
 *
 * MtPointLogComponent
 *
 */

import React, { useState, useEffect, useRef } from 'react';
// import PropTypes from 'prop-types';
import styled from 'styled-components';
import axiosInstance from 'services';
import { Row, Col, Spin } from 'antd';
import { Colors } from 'theme/colors';
import { ReloadOutlined } from '@ant-design/icons';
import InfiniteScroll from 'react-infinite-scroll-component';
import moment from 'moment';
import PrimaryButtonComponent from 'components/PrimaryButtonComponent';
import AddMtPointComponent from 'components/AddMtPointComponent';
import { Images } from 'images/index';
import ConfirmationPopupComponent from 'components/ConfirmationPopupComponent';

const LoadingSpinner = styled(Spin)``;

const MoontrekkerPoint = styled(Row)`
  background-color: ${Colors.white};
  padding: 3px 10px 3px 15px;
  border-radius: 8px;

  > img {
    height: 17px;
    width: 17px;
    object-fit: contain;
    margin-left: 5px;
  }
`;

const HistoryList = styled.div`
  -ms-overflow-style: none; /* IE and Edge */
  scrollbar-width: none;
  flex: 1;
  padding: 20px 40px;

  > div > div {
    -ms-overflow-style: none; /* IE and Edge */
    scrollbar-width: none;
  }

  > div > div::-webkit-scrollbar {
    display: none;
  }
`;

const DividerLine = styled.div`
  height: 1px;
  background-color: ${Colors.white};
  margin-top: 35px;
  margin-bottom: 25px;
`;

function MtPointLogComponent({ userId }) {
  const [loading, setLoading] = useState(true);
  const [mpHistory, setMpHistory] = useState([]);

  const [hasNextPage, setHasNextPage] = useState(true);
  const [action, setAction] = useState('delete');
  const [selectedTransactionId, setSelectedTransactionId] = useState(0);
  const [showConfirmPopup, setShowConfirmPopup] = useState(false);
  const [pageNum, setPageNum] = useState(1);

  const [addModalVisible, setAddModalVisible] = useState(false);

  // for clean up unmount
  const unmounted = useRef(false);

  useEffect(() => {
    getHistory();

    return () => {
      unmounted.current = true;
    };
  }, []);

  const getHistory = (refresh = false) => {
    const page = refresh ? 1 : pageNum;
    const nextPage = refresh ? true : hasNextPage;

    if (nextPage) {
      setLoading(true);

      axiosInstance
        .get(`api/moontrekker-points?page=${page}&user_id=${userId}`)
        .then(res => {
          if (!unmounted.current) {
            const historyList = refresh
              ? res.data.data
              : mpHistory.concat(res.data.data);
            setMpHistory(historyList);

            if (res.data.next_page_url) {
              setPageNum(page + 1);
              setHasNextPage(true);
              setLoading(true);
            } else {
              setPageNum(page);
              setHasNextPage(false);
              setLoading(false);
            }
          }
        })
        .catch(() => {
          setLoading(false);
        });
    }
  };

  return (
    <HistoryList className="white-text" style={{ overflow: 'hidden' }}>
      <ConfirmationPopupComponent
        actionRequire
        visibility={showConfirmPopup}
        dismissModal={() => {
          setShowConfirmPopup(false);
        }}
        title={
          action === 'delete'
            ? 'Delete MoonTrekker Point'
            : 'Restore MoonTrekker Point'
        }
        message={
          action === 'delete'
            ? "Do you wish to delete this user's MoonTrekker Point?"
            : "Do you wish to restore this user's MoonTrekker Point?"
        }
        leftAction={() => {
          if (action === 'delete') {
            axiosInstance
              .delete(`api/moontrekker-points/${selectedTransactionId}`)
              .then(res => {
                const updatePoint = mpHistory.findIndex(
                  mp => mp.record_id === selectedTransactionId,
                );
                mpHistory[updatePoint].deleted_at = res.data.deleted_at;
                setShowConfirmPopup(false);
              });
          }
          if (action === 'restore') {
            axiosInstance
              .put(`api/moontrekker-points/${selectedTransactionId}`, {
                deleted_at: '',
              })
              .then(() => {
                const updatePoint = mpHistory.findIndex(
                  mp => mp.record_id === selectedTransactionId,
                );
                mpHistory[updatePoint].deleted_at = null;
                setShowConfirmPopup(false);
              });
          }
        }}
        rightAction={() => {
          setShowConfirmPopup(false);
        }}
      />
      {loading && mpHistory.length === 0 ? (
        <Row justify="center" style={{ flex: 1 }}>
          <LoadingSpinner size="large" />
        </Row>
      ) : (
        <InfiniteScroll
          style={{ width: 800 }}
          dataLength={mpHistory.length}
          next={getHistory}
          hasMore={hasNextPage}
          loader={
            <Row justify="center" style={{ flex: 1 }}>
              <LoadingSpinner size="large" />
            </Row>
          }
          endMessage={
            !mpHistory.length && (
              <div
                className="h3 cyan-text"
                style={{
                  textAlign: 'center',
                  padding: '70px 0px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                }}
              >
                <b>There is nothing here yet.</b>
                <PrimaryButtonComponent
                  style={{
                    margin: '10px 10px 0px',
                  }}
                  label="Add Point"
                  onClick={() => {
                    setAddModalVisible(true);
                  }}
                  iconRight={false}
                />
              </div>
            )
          }
        >
          {!!mpHistory.length && (
            <PrimaryButtonComponent
              style={{
                marginBottom: '30px',
              }}
              label="Add Point"
              onClick={() => {
                setAddModalVisible(true);
              }}
              iconRight={false}
            />
          )}

          {mpHistory.map(history => (
            <div key={history.record_id} className="white-text">
              <div className="bodyBold">{`${moment
                .utc(history.created_at)
                .local()
                .format('DD MMM')} at ${moment
                .utc(history.created_at)
                .local()
                .format('h:mmA')}`}</div>
              <div>
                <Row
                  wrap={false}
                  justify="spce-between"
                  align="middle"
                  style={{ marginTop: '6px' }}
                >
                  <Col
                    flex="auto"
                    className="body"
                    style={{ marginRight: '25px' }}
                  >
                    {history.description}
                  </Col>
                  <Col flex="none">
                    <MoontrekkerPoint
                      align="middle"
                      className="bodyBold cyan-text"
                    >
                      {history.amount || 0}
                      <img src={Images.pointIcon} alt="point" />
                    </MoontrekkerPoint>
                  </Col>
                </Row>

                <div
                  style={{
                    marginTop: '8px',
                    display: 'flex',
                    justifyContent: 'space-between',
                  }}
                  className="captionBold"
                >
                  <div className="orange-text">
                    {history.deleted_at ? (
                      <div>
                        Deleted date:{' '}
                        {moment
                          .utc(history.deleted_at)
                          .local()
                          .format('DD/MMM/yyyy HH:mm')}
                      </div>
                    ) : null}
                  </div>
                  {history.deleted_at ? (
                    <div
                      className="green-text"
                      style={{
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                      }}
                      onClick={() => {
                        setSelectedTransactionId(history.record_id);
                        setAction('restore');
                        setShowConfirmPopup(true);
                      }}
                    >
                      Restore <ReloadOutlined style={{ marginLeft: 6 }} />
                    </div>
                  ) : (
                    <div
                      className="delete-text"
                      style={{
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                      }}
                      onClick={() => {
                        setSelectedTransactionId(history.record_id);
                        setAction('delete');
                        setShowConfirmPopup(true);
                      }}
                    >
                      Remove
                      <img
                        src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABYAAAAZCAYAAAA14t7uAAAABmJLR0QA/wD/AP+gvaeTAAAC80lEQVRIiaWVz2scdRjGP8/M7G4kblBLK2oRodCDSaPJZJuihxQ8WvGgLRTMXdCDV8E/wIPnnvxx0VNBPXrTky2ZXbZNCcWDsSIYNNWUTQjZSb7fx0M2MWtq0k3e0/C8836+zzzzMiMOqdvj48MhTcdDlg0DKMaQxPjTZLv9+0FzOqg512i8kcT4ieAFQ7UnG/gD+Hqq1XrvSOBmnjeRXsa+IWkVwHYqewxpWDHOTLbbt/8X3MzziqU3kxjP7m1aeld2zdJnstf26FeBMeAb2c0dPUgrCXw71Wot6fuLF7P66uoPwAUgPegJHrF+DWn6djbS6bwUpVxwD7h5TOiLwEQWwgdZTJK67CHD/Uar9c5xqM08vwZMRGko21Wl51p5fuM4YMPJnetM9iLwG/azEZ4RbByRmwE1YEX2XQHMnzv3ZFmttmVnIU0vCTqD2/XnsmeAD6darY8TgPE7d1aA0lKlWpbLjaJYJIRZxfiVYuw0imIxCeF9QvhiM8uWGkWxiP2RYrw2VRT3GkWxSG91ewmQ7DmzK7sW0nQEQNJrwAXHOANgaUZJcj7b2hrrAV4BJlt5frrnuAbY0vJOLts6lEiPWaoPHMO2kxr2huxOv2OpC1RlP3Ekrl0FNpIYO32OgbJ3w8mHDR5W3t6IcrNSWe1zLLsLEJPk1KDQhdHRquxKAmWt2+0HezsKkhhPDApeGx6uW6oYtsbn59f7wPSisPTUoOBqWdaBqqHU9vd6fxSyHx8UHNK0ntg1QXdH+3fd7A1JWKoNCrY0YhjqbRb9jqW/YfftwvY3Y91ZttQb7mKvW7rf65dAmYbQIYQTggy73AcG/uqdUAPYyrJZ2W+dL4ofAdIQroY0vTw9N/dL76DLaZJcmbh160EiPQ2wN4rdf14xNfVqYn9neAAsSIqPGkWE52WPSvoybzZn+8AAzTz/FLgEnPpv75Bak31X9uuT7fbyPjDAzenp05XNzbMxTZP98w+vJIQ/fz5zZuHK9ethR/sHReBJW23AKVQAAAAASUVORK5CYII="
                        alt="delete"
                        style={{ width: 12, marginLeft: 6 }}
                      />
                    </div>
                  )}
                </div>
              </div>

              <DividerLine />
            </div>
          ))}
          {addModalVisible && (
            <AddMtPointComponent
              userId={userId}
              visibility={addModalVisible}
              onCancel={() => {
                setAddModalVisible(false);
                getHistory(true);
              }}
            />
          )}
        </InfiniteScroll>
      )}
    </HistoryList>
  );
}

MtPointLogComponent.propTypes = {};

export default MtPointLogComponent;
