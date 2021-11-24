/**
 *
 * AnnouncementCreatePage
 *
 */

import React, { memo, useState } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { createStructuredSelector } from 'reselect';
import { compose } from 'redux';
import { Helmet } from 'react-helmet';
import axiosInstance, { createFormData } from 'services';
import styled from 'styled-components';
import { Colors } from 'theme/colors';
import { Images } from 'images/index';
import { replace } from 'connected-react-router';
import Resizer from 'react-image-file-resizer';
import { Row, Radio, Col, DatePicker } from 'antd';
import TextInputComponent from 'components/TextInputComponent';
import NavigationWrapperComponent from 'components/NavigationWrapperComponent';
import PrimaryButtonComponent from 'components/PrimaryButtonComponent';
import TextAreaComponent from 'components/TextAreaComponent';
import { EditorState, convertToRaw } from 'draft-js';
import draftToHtml from 'draftjs-to-html';
import { Editor } from 'react-draft-wysiwyg';
import 'react-draft-wysiwyg/dist/react-draft-wysiwyg.css';
import moment from 'moment';

import { useInjectSaga } from 'utils/injectSaga';
import { useInjectReducer } from 'utils/injectReducer';
import makeSelectAnnouncementCreatePage from './selectors';
import reducer from './reducer';
import saga from './saga';

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

const ImageUploadSection = styled(Row)`
  position: relative;

  > img {
    height: 250px;
    width: 434px;
    object-fit: cover;
    border-radius: 8px;
  }
`;

const UpdateIcon = styled.div`
  background-color: ${Colors.primary};
  height: 56px;
  width: 56px;
  border-radius: 50px;
  position: absolute;
  bottom: 15px;
  right: 15px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;

  > img {
    height: 25px;
    width: 25px;
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
  margin-bottom: 25px;

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
const DateTimePicker = styled(DatePicker)`
  background-color: ${Colors.shadow};
  height: 48px;
  width: 100%;
  border: 2px solid ${props => (props.error ? Colors.error : Colors.white)};
  border-radius: 8px;
  margin-bottom: 25px;

  :focus,
  :active,
  :hover {
    border-color: ${props =>
      props.error ? Colors.error : Colors.white} !important;
  }

  .ant-picker-suffix {
    color: ${Colors.placeholderTextColor};
  }

  .ant-picker-input > input {
    color: ${Colors.white};
    text-align: center;
  }
`;

const Divider = styled.div`
  height: 2px;
  background-color: ${Colors.white};
  width: 100%;
  margin: 40px 0px;
`;

export function AnnouncementCreatePage({ dispatch, match }) {
  useInjectReducer({ key: 'announcementCreatePage', reducer });
  useInjectSaga({ key: 'announcementCreatePage', saga });

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [htmlContent, setHtmlContent] = useState('');
  const [notification, setNotification] = useState('');
  const [pinPost, setPinPost] = useState(1);
  const [tempFile, setTempFile] = useState(null);
  const [tempPic, setTempPic] = useState(null);
  const [scheduleAt, setScheduleAt] = useState(null);

  const [loading, setLoading] = useState(false);

  const [isFocused, setIsFocused] = useState(false);
  const [editorState, setEditorState] = useState(() =>
    EditorState.createEmpty(),
  );

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

  const submit = () => {
    if (!loading) {
      setLoading(true);
      const params = {
        title,
        notification_message: notification,
        description: content,
        html_content: htmlContent,
        cover_image: tempFile || null,
        pin_post: pinPost,
        scheduled_at: scheduleAt
          ? moment
              .utc(`${scheduleAt}${moment().format('Z')}`)
              .format('YYYY-MM-DD HH:mm')
          : '',
      };

      axiosInstance
        .post('api/announcement', createFormData(params), {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        })
        .then(res => {
          setLoading(false);
          dispatch(replace(`../../announcements/${res.data.announcement_id}`));
        })
        .catch(() => {
          setLoading(false);
        });
    }
  };

  const handleEditorChange = state => {
    setEditorState(state);
    const currentContentAsHTML = draftToHtml(
      convertToRaw(state.getCurrentContent()),
    );
    setHtmlContent(
      currentContentAsHTML.replace(/<ins>/g, '<u>').replace(/<\/ins>/g, '</u>'),
    );
  };

  return (
    <div>
      <Helmet>
        <title>Admin Panel - MoonTrekker</title>
        <meta name="description" content="MoonTrekker" />
      </Helmet>
      <NavigationWrapperComponent match={match}>
        <PageWrapperStyled>
          <p className="h2 white-text" style={{ marginBottom: '40px' }}>
            Create New Activity Feed
          </p>
          <form className="white-text">
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
              value={content}
              onChange={value => {
                setContent(value);
              }}
              placeholder="Short Description (will be displayed on Card Summary)"
              label="Card Summary"
            />
            <Row wrap={false}>
              <Label className="bodyBold white-text">Description</Label>
              <TextAreaInputSection type="desc" align="middle">
                <Editor
                  placeholder={
                    isFocused ? '' : 'Full Description in HTML Format'
                  }
                  className="white-text"
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
                        Colors.error,
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
              {tempPic ? (
                <ImageUploadSection justify="center">
                  <img src={tempPic} alt="profile-pic" />
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
                    multiple
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
            <Divider />
            <Row wrap={false}>
              <Label className="bodyBold white-text">
                Schedule Date (Optional)
              </Label>
              <Col flex="auto">
                <Row justify="space-between">
                  <DateTimePicker
                    defaultValue={null}
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

            <Row justify="center" style={{ margin: '20px 0px 40px' }}>
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
                  !content ||
                  !content.trim().length ||
                  !htmlContent ||
                  !htmlContent.trim().length ||
                  !notification ||
                  !notification.trim().length
                }
                onClick={submit}
              />
            </Row>
          </form>
        </PageWrapperStyled>
      </NavigationWrapperComponent>
    </div>
  );
}

AnnouncementCreatePage.propTypes = {
  dispatch: PropTypes.func.isRequired,
};

const mapStateToProps = createStructuredSelector({
  announcementCreatePage: makeSelectAnnouncementCreatePage(),
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
)(AnnouncementCreatePage);
