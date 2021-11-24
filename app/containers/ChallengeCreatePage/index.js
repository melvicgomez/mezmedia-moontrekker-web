/* eslint-disable no-restricted-globals */
/**
 *
 * ChallengeCreatePage
 *
 */
import React, { memo, useState } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import styled from 'styled-components';
import { createStructuredSelector } from 'reselect';
import { compose } from 'redux';
import axiosInstance, { createFormData } from 'services';
import { Helmet } from 'react-helmet';
import { Row, Select, Radio, Col, DatePicker } from 'antd';
import { replace } from 'connected-react-router';
import Resizer from 'react-image-file-resizer';
import { Colors } from 'theme/colors';
import { Images } from 'images/index';
import moment from 'moment';
import NavigationWrapperComponent from 'components/NavigationWrapperComponent';
import PrimaryButtonComponent from 'components/PrimaryButtonComponent';
import TextInputComponent from 'components/TextInputComponent';
import TextAreaComponent from 'components/TextAreaComponent';
import { EditorState, convertToRaw } from 'draft-js';
import draftToHtml from 'draftjs-to-html';
import { Editor } from 'react-draft-wysiwyg';
import 'react-draft-wysiwyg/dist/react-draft-wysiwyg.css';

import { useInjectSaga } from 'utils/injectSaga';
import { useInjectReducer } from 'utils/injectReducer';
import makeSelectChallengeCreatePage from './selectors';
import reducer from './reducer';
import saga from './saga';

const { Option } = Select;

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

const TypeSelector = styled(Select)`
  width: 100% !important;
  margin-bottom: 25px;
  border: 2px solid ${Colors.white} !important;
  border-radius: 8px !important;

  > .ant-select-selector {
    height: 48px !important;
    background-color: ${Colors.shadow} !important;
    border-radius: 8px !important;
    border: none !important;
    text-align: center !important;
    display: flex !important;
    align-items: center !important;
  }
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

export function ChallengeCreatePage({ dispatch, match, location }) {
  useInjectReducer({ key: 'challengeCreatePage', reducer });
  useInjectSaga({ key: 'challengeCreatePage', saga });

  const typeList = [
    { name: 'Standard Challenge', type: 'challenge_standard' },
    { name: 'Single Checkpoint Challenge', type: 'challenge_single' },
    { name: 'Either End Challenge', type: 'challenge_either_end' },
    { name: 'Training Challenge', type: 'challenge_training' },
  ];

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [htmlContent, setHtmlContent] = useState('');
  const [difficulty, setDifficulty] = useState(0);
  const [type, setType] = useState('Select Challenge Type');
  const [multipleAttempt, setMultipleAttempt] = useState(0);
  const [timeRequired, setTimeRequired] = useState(1);
  const [distanceRequired, setDistanceRequired] = useState(1);
  const [distance, setDistance] = useState('');
  const [reward, setReward] = useState('');
  const [trailOverview, setTrailOverview] = useState('');
  const [startDateTime, setStartDateTime] = useState(null);
  const [endDateTime, setEndDateTime] = useState(null);
  const [scheduleAt, setScheduleAt] = useState(null);

  const [tempFile, setTempFile] = useState(null);
  const [tempPic, setTempPic] = useState(null);

  const [loading, setLoading] = useState(false);

  const [contentIsFocused, setContentIsFocused] = useState(false);
  const [trailIsFocused, setTrailIsFocused] = useState(false);
  const [contentEditorState, setContentEditorState] = useState(
    EditorState.createEmpty(),
  );
  const [trailEditorState, setTrailEditorState] = useState(
    EditorState.createEmpty(),
  );

  const submit = () => {
    if (!loading) {
      setLoading(true);

      const params = {
        title,
        description,
        html_content: htmlContent
          ? htmlContent === '<p></p>'
            ? ''
            : htmlContent
          : '',
        type: typeList.find(i => i.name.includes(type)).type,
        difficulty: parseInt(difficulty, 10),
        multiple_attempt_available: multipleAttempt,
        is_time_required: timeRequired,
        is_distance_required: distanceRequired,
        distance: distance || 0,
        reward_count: reward || 0,
        trail_overview_html: trailOverview
          ? trailOverview === '<p></p>'
            ? ''
            : trailOverview
          : '',
        started_at: moment
          .utc(`${startDateTime}${moment().format('Z')}`)
          .format('YYYY-MM-DD HH:mm'),
        ended_at: moment
          .utc(`${endDateTime}${moment().format('Z')}`)
          .format('YYYY-MM-DD HH:mm'),
        schedule_at: scheduleAt
          ? moment
              .utc(`${scheduleAt}${moment().format('Z')}`)
              .format('YYYY-MM-DD HH:mm')
          : '',
      };

      if (tempFile) {
        params.challenge_cover_image = tempFile;
      }

      axiosInstance
        .post('api/challenge', createFormData(params), {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        })
        .then(res => {
          setLoading(false);
          dispatch(
            replace({
              pathname: `../../../challenges/${res.data.data.challenge_id}`,
              state: { tab: 'info' },
            }),
          );
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

  const handleContentEditorChange = state => {
    setContentEditorState(state);
    const currentContentAsHTML = draftToHtml(
      convertToRaw(state.getCurrentContent()),
    );
    setHtmlContent(
      currentContentAsHTML.replace(/<ins>/g, '<u>').replace(/<\/ins>/g, '</u>'),
    );
  };

  const handleTrailEditorChange = state => {
    setTrailEditorState(state);
    const currentContentAsHTML = draftToHtml(
      convertToRaw(state.getCurrentContent()),
    );
    setTrailOverview(
      currentContentAsHTML.replace(/<ins>/g, '<u>').replace(/<\/ins>/g, '</u>'),
    );
  };

  return (
    <div>
      <Helmet>
        <title>Admin Panel - MoonTrekker</title>
        <meta name="description" content="MoonTrekker" />
      </Helmet>
      <NavigationWrapperComponent
        match={match}
        location={location}
        topTab={null}
      >
        <PageWrapperStyled>
          <p className="h2 white-text" style={{ marginBottom: '40px' }}>
            Create Challenge
          </p>
          <div className="white-text">
            <Row wrap={false}>
              <Label className="bodyBold white-text">Challenge Type</Label>
              <TypeSelector
                defaultValue={type}
                showArrow={false}
                className="bodyBold"
                style={{
                  width: 120,
                  color:
                    type === 'Select Challenge Type'
                      ? Colors.placeholderTextColor
                      : Colors.white,
                }}
                onChange={value => {
                  setType(value);
                }}
                dropdownStyle={{ zIndex: 999999 }}
              >
                {typeList.map((option, index) => (
                  <Option
                    key={index}
                    value={option.name}
                    className="bodyBold grey-text"
                  >
                    {option.name}
                  </Option>
                ))}
              </TypeSelector>
            </Row>
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
                  placeholder={
                    contentIsFocused ? '' : 'Full Description in HTML Format'
                  }
                  className="white-text body"
                  editorState={contentEditorState}
                  onEditorStateChange={handleContentEditorChange}
                  toolbarClassName="toolbarClassName"
                  editorClassName="editorClassName white-text"
                  onFocus={() => setContentIsFocused(true)}
                  onBlur={() => setContentIsFocused(false)}
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
            <Row wrap={false} style={{ margin: '-10px 0px 15px' }}>
              <Label className="bodyBold white-text">
                Allow Multiple Attempt?
              </Label>
              <Radio.Group
                onChange={async e => {
                  setMultipleAttempt(e.target.value === 'Yes' ? 1 : 0);
                }}
                value={multipleAttempt === 0 ? 'No' : 'Yes'}
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
            <Row wrap={false} style={{ margin: '-10px 0px 15px' }}>
              <Label className="bodyBold white-text">Time Required?</Label>
              <Radio.Group
                onChange={async e => {
                  setTimeRequired(e.target.value === 'Yes' ? 1 : 0);
                }}
                value={timeRequired === 0 ? 'No' : 'Yes'}
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
            <Row wrap={false} style={{ margin: '-10px 0px 15px' }}>
              <Label className="bodyBold white-text">Distance Required?</Label>
              <Radio.Group
                onChange={async e => {
                  setDistanceRequired(e.target.value === 'Yes' ? 1 : 0);
                }}
                value={distanceRequired === 0 ? 'No' : 'Yes'}
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
            {distanceRequired ? (
              <TextInputComponent
                title="Distance (KM)"
                defaultValue={distance}
                value={distance}
                admin
                placeholder="Overall Distance"
                onChange={value => {
                  const reg = /^-?\d*(\.\d*)?$/;
                  if (!isNaN(value) && reg.test(value)) {
                    setDistance(value);
                  }
                }}
              />
            ) : null}
            <TextInputComponent
              title="Difficulty Level"
              defaultValue={difficulty}
              value={difficulty}
              admin
              placeholder="Difficulty Level"
              onChange={value => {
                const reg = /^-?\d*(\.\d*)?$/;
                if (!isNaN(value) && reg.test(value)) {
                  setDifficulty(value);
                }
              }}
            />
            <TextInputComponent
              title="Reward Amount"
              defaultValue={reward}
              value={reward}
              admin
              placeholder="Reward Amount"
              onChange={value => {
                const reg = /^-?\d*(\.\d*)?$/;
                if (!isNaN(value) && reg.test(value)) {
                  setReward(value);
                }
              }}
            />
            <Row wrap={false}>
              <Label className="bodyBold white-text">Trail Overview</Label>
              <TextAreaInputSection type="desc" align="middle">
                <Editor
                  placeholder={
                    trailIsFocused
                      ? ''
                      : 'Trail Description in Checkpoint Preview Page'
                  }
                  className="white-text"
                  editorState={trailEditorState}
                  onEditorStateChange={handleTrailEditorChange}
                  toolbarClassName="toolbarClassName"
                  editorClassName="editorClassName white-text"
                  onFocus={() => setTrailIsFocused(true)}
                  onBlur={() => setTrailIsFocused(false)}
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
            <Row wrap={false}>
              <Label className="bodyBold white-text">Start & End Date</Label>
              <Col flex="auto">
                <Row justify="space-between">
                  <DateTimePicker
                    className="bodyBold white-text"
                    placeholder="Start Date & Time"
                    disabledDate={current =>
                      current && current < moment().startOf('day')
                    }
                    showTime={{ format: 'HH:mm' }}
                    format="YYYY-MM-DD HH:mm"
                    onChange={(value, dateString) => {
                      setStartDateTime(dateString);
                    }}
                  />
                  <DateTimePicker
                    className="bodyBold white-text"
                    placeholder="End Date & Time"
                    disabledDate={current =>
                      current && current < moment().startOf('day')
                    }
                    showTime={{ format: 'HH:mm' }}
                    format="YYYY-MM-DD HH:mm"
                    onChange={(value, dateString) => {
                      setEndDateTime(dateString);
                    }}
                  />
                </Row>
              </Col>
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
                  <ScheduleDateTimePicker
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
                  !description ||
                  !description.trim().length ||
                  !htmlContent ||
                  !htmlContent.trim().length ||
                  type === 'Select Challenge Type' ||
                  !startDateTime ||
                  !endDateTime
                }
                onClick={() => submit()}
              />
            </Row>
          </div>
        </PageWrapperStyled>
      </NavigationWrapperComponent>
    </div>
  );
}

ChallengeCreatePage.propTypes = {
  dispatch: PropTypes.func.isRequired,
};

const mapStateToProps = createStructuredSelector({
  challengeCreatePage: makeSelectChallengeCreatePage(),
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
)(ChallengeCreatePage);
