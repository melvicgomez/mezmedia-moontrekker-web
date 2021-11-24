/**
 *
 * AnnouncementEditPage
 *
 */

import React, { memo, useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import styled from 'styled-components';
import { createStructuredSelector } from 'reselect';
import { compose } from 'redux';
import axiosInstance, { createFormData } from 'services';
import { Helmet } from 'react-helmet';
import { Row, Spin, Radio, Col, DatePicker } from 'antd';
import { replace, goBack } from 'connected-react-router';
import Resizer from 'react-image-file-resizer';
import { Colors } from 'theme/colors';
import { Images } from 'images/index';
import moment from 'moment';
import NavigationWrapperComponent from 'components/NavigationWrapperComponent';
import PrimaryButtonComponent from 'components/PrimaryButtonComponent';
import TextInputComponent from 'components/TextInputComponent';
import TextAreaComponent from 'components/TextAreaComponent';
import {
  EditorState,
  convertFromHTML,
  ContentState,
  convertToRaw,
} from 'draft-js';
import draftToHtml from 'draftjs-to-html';
import { Editor } from 'react-draft-wysiwyg';
import 'react-draft-wysiwyg/dist/react-draft-wysiwyg.css';

import { useInjectSaga } from 'utils/injectSaga';
import { useInjectReducer } from 'utils/injectReducer';
import makeSelectAnnouncementEditPage from './selectors';
import reducer from './reducer';
import saga from './saga';

const LoadingSpinner = styled(Spin)`
  margin-top: 30px;
`;

const PageWrapperStyled = styled.div`
  width: 1000px;
  margin: 50px 30px 20px;
`;

const Label = styled.p`
  margin-bottom: 6px;
  width: 250px;
  min-width: 250px;
  padding-top: 10px;
`;

const DateTimePicker = styled(DatePicker)`
  background-color: ${Colors.shadow};
  height: 48px;
  width: 45%;
  border: 2px solid ${props => (props.error ? Colors.warning : Colors.white)};
  border-radius: 8px;
  margin-bottom: 25px;

  :focus,
  :active,
  :hover {
    border-color: ${props =>
      props.error ? Colors.warning : Colors.white} !important;
  }

  .ant-picker-suffix {
    color: ${Colors.placeholderTextColor};
  }

  .ant-picker-input > input {
    color: ${Colors.white};
    text-align: center;
  }
`;

const ScheduleDateTimePicker = styled(DateTimePicker)`
  width: 100%;
  margin-bottom: 15px;
`;

const Divider = styled.div`
  height: 2px;
  background-color: ${Colors.white};
  width: 100%;
  margin: 40px 0px 20px;
`;

const ImageUploadSection = styled(Row)`
  position: relative;

  > img {
    height: 250px;
    width: 434px;
    object-fit: cover;
    border-radius: 8px;
    border: 2px solid white;
  }
`;

const UpdateIcon = styled.div`
  background-color: ${Colors.primary};
  height: 40px;
  width: 40px;
  border-radius: 50px;
  position: absolute;
  bottom: 10px;
  right: 10px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;

  > img {
    height: 20px;
    width: 20px;
  }
`;

const UploadPicSection = styled(Row)`
  background-color: ${Colors.shadow};
  height: 250px;
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

const TextAreaInputSection = styled(Row)`
  border-radius: 8px;
  width: 100%;
  height: auto !important;
  color: ${Colors.bodyText};
  box-shadow: inset 0px 1px 2px 0px #00000035;
  background-color: ${Colors.shadow};
  border: 2px solid ${Colors.white};
  padding: 10px 15px;
  margin-bottom: 20px;

  .toolbarClassName {
    padding-bottom: 12px;
    border: none;
    border-bottom: 1px solid ${Colors.white};
  }

  .editorClassName {
    color: ${Colors.white};
    h1,
    h2,
    h3,
    h4,
    h5,
    h6 {
      color: ${Colors.white};
    }
    pre {
      color: ${Colors.black};
    }
  }
`;

export function AnnouncementEditPage({ dispatch, match }) {
  useInjectReducer({ key: 'announcementEditPage', reducer });
  useInjectSaga({ key: 'announcementEditPage', saga });

  const challengeId = match.params.id;
  const [loadData, setLoadData] = useState(true);
  const [announcementData, setAnnouncementData] = useState(null);

  useEffect(() => {
    window.scrollTo(0, 0);
    getData();
  }, []);

  const getData = () => {
    axiosInstance
      .get(`api/announcement/${challengeId}`)
      .then(res => {
        setAnnouncementData(res.data.data);
      })
      .finally(() => {
        setLoadData(false);
      });
  };

  const Form = ({ announcement }) => {
    const [title, setTitle] = useState(announcement.title);
    const [description, setDescription] = useState(announcement.description);
    const [htmlContent, setHtmlContent] = useState(announcement.html_content);
    const [notification, setNotification] = useState(
      announcement.notification_message,
    );
    const [pinPost, setPinPost] = useState(announcement.pin_post || 0);
    const [scheduleAt, setScheduleAt] = useState(
      announcement.scheduled_at ? moment.utc(announcement.scheduled_at) : null,
    );
    const [image] = useState(announcement.cover_image);

    const [tempFile, setTempFile] = useState(null);
    const [tempPic, setTempPic] = useState(null);

    const [loading, setLoading] = useState(false);

    const [isFocused, setIsFocused] = useState(false);
    const [editorState, setEditorState] = useState(() => {
      if (announcement.html_content) {
        const blocksFromHTML = convertFromHTML(announcement.html_content);
        const state = ContentState.createFromBlockArray(
          blocksFromHTML.contentBlocks,
          blocksFromHTML.entityMap,
        );
        return EditorState.createWithContent(state);
      } else {
        return EditorState.createEmpty();
      }
    });

    const submit = () => {
      if (!loading) {
        setLoading(true);

        const params = {
          announcement_id: announcementData.announcement_id,
          title,
          notification_message: notification,
          description,
          html_content: htmlContent,
          cover_image: tempFile || null,
          pin_post: pinPost,
          scheduled_at: scheduleAt
            ? moment
                .utc(`${scheduleAt}${moment().format('Z')}`)
                .format('YYYY-MM-DD HH:mm')
            : '',
        };

        if (tempFile) {
          params.cover_image = tempFile;
        }

        axiosInstance
          .post('api/announcement', createFormData(params), {
            headers: {
              'Content-Type': 'multipart/form-data',
            },
          })
          .then(() => {
            setLoading(false);
            dispatch(replace(`../../../announcements/${challengeId}`));
          })
          .catch(() => {
            setLoading(false);
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

    const handleEditorChange = state => {
      setEditorState(state);
      const currentContentAsHTML = draftToHtml(
        convertToRaw(state.getCurrentContent()),
      );
      setHtmlContent(
        currentContentAsHTML
          .replace(/<ins>/g, '<u>')
          .replace(/<\/ins>/g, '</u>'),
      );
    };

    return (
      <div className="white-text">
        <TextInputComponent
          title="Title"
          defaultValue={title}
          value={title}
          admin
          placeholder="Title"
          onChange={value => {
            setTitle(value);
          }}
        />
        <TextAreaComponent
          value={description}
          onChange={value => {
            setDescription(value);
          }}
          placeholder="Short Description (will be displayed on Card Summary)"
          label="Card Summary"
        />
        <Row wrap={false}>
          <Label className="bodyBold white-text">Description</Label>
          <TextAreaInputSection type="desc" align="middle">
            <Editor
              placeholder={isFocused ? '' : 'Full Description in HTML Format'}
              className="white-text body"
              editorState={editorState}
              onEditorStateChange={handleEditorChange}
              toolbarClassName="toolbarClassName"
              editorClassName="editorClassName white-text"
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              toolbar={{
                options: [
                  'inline',
                  'blockType',
                  'list',
                  'textAlign',
                  'link',
                  'embedded',
                  'emoji',
                  'image',
                  'colorPicker',
                ],
                colorPicker: {
                  colors: [
                    Colors.warning,
                    Colors.cyan,
                    Colors.darkBlue,
                    Colors.black,
                    Colors.darkGrey,
                    Colors.white,
                  ],
                },
              }}
            />
          </TextAreaInputSection>
        </Row>
        <TextAreaComponent
          value={notification}
          onChange={value => {
            setNotification(value);
          }}
          placeholder="Notification Message"
          label="Notification Message"
        />
        <Row wrap={false} style={{ margin: '-10px 0px 15px' }}>
          <Label className="bodyBold white-text">Pin Post</Label>
          <Radio.Group
            onChange={async e => {
              setPinPost(e.target.value === 'Yes' ? 1 : 0);
            }}
            value={pinPost === 0 ? 'No' : 'Yes'}
          >
            <Row>
              {['Yes', 'No'].map((option, i) => (
                <div key={i} style={{ padding: '5px 10px' }}>
                  <Radio
                    className="white-text bodyBold"
                    value={option}
                    style={{ padding: '5px' }}
                  >
                    {option}
                  </Radio>
                </div>
              ))}
            </Row>
          </Radio.Group>
        </Row>
        <Row wrap={false}>
          <Label className="bodyBold white-text">Cover Image</Label>
          {image || tempPic ? (
            <ImageUploadSection justify="center">
              <img
                src={
                  tempPic ||
                  `${
                    process.env.IMAGE_URL_PREFIX
                  }announcement/${challengeId}/${image}`
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
        </Row>

        {!announcement.published_at && (
          <>
            <Divider />
            <Row wrap={false}>
              <Label className="bodyBold white-text">
                Schedule Date (Optional)
              </Label>
              <Col flex="auto">
                <Row justify="space-between">
                  <ScheduleDateTimePicker
                    defaultValue={
                      scheduleAt
                        ? moment.utc(scheduleAt, 'YYYY-MM-DD HH:mm').local()
                        : null
                    }
                    className="bodyBold white-text"
                    placeholder="Schedule Date"
                    showNow={false}
                    disabledDate={current =>
                      current && current < moment().startOf('day')
                    }
                    showTime={{ format: 'HH:mm' }}
                    format="YYYY-MM-DD HH:mm"
                    onChange={(value, dateString) => {
                      setScheduleAt(dateString);
                    }}
                  />
                </Row>
              </Col>
            </Row>
          </>
        )}

        <Row justify="center" style={{ margin: '40px' }}>
          <PrimaryButtonComponent
            style={{
              width: '200px',
              display: 'flex',
              justifyContent: 'center',
            }}
            label="Save and Preview"
            loading={loading}
            disabled={
              !title ||
              !title.trim().length ||
              !description ||
              !description.trim().length ||
              !htmlContent ||
              !htmlContent.trim().length
            }
            onClick={() => submit()}
          />
          <PrimaryButtonComponent
            style={{
              width: '200px',
              marginLeft: '40px',
              display: 'flex',
              justifyContent: 'center',
            }}
            label="Cancel"
            disabled={false}
            onClick={() => dispatch(goBack())}
          />
        </Row>
      </div>
    );
  };

  return (
    <div>
      <Helmet>
        <title>Admin Panel - MoonTrekker</title>
        <meta name="description" content="MoonTrekker" />
      </Helmet>
      <NavigationWrapperComponent match={match} topTab={null}>
        <PageWrapperStyled>
          <p className="h2 white-text" style={{ marginBottom: '40px' }}>
            Edit Challenge
          </p>
          {!loadData && announcementData ? (
            <Form announcement={announcementData} />
          ) : (
            <Row justify="center">
              <LoadingSpinner size="large" />
            </Row>
          )}
        </PageWrapperStyled>
      </NavigationWrapperComponent>
    </div>
  );
}

AnnouncementEditPage.propTypes = {
  dispatch: PropTypes.func.isRequired,
};

const mapStateToProps = createStructuredSelector({
  announcementEditPage: makeSelectAnnouncementEditPage(),
});

function mapDispatchToProps(dispatch) {
  return {
    dispatch,
  };
}

const withConnect = connect(
  mapStateToProps,
  mapDispatchToProps,
);

export default compose(
  withConnect,
  memo,
)(AnnouncementEditPage);
