/* eslint-disable no-restricted-globals */
/* eslint-disable react/no-danger */
import React, { useState, useEffect, useRef } from 'react';
import { Row, Spin, Col } from 'antd';
import styled from 'styled-components';
import DOMPurify from 'dompurify';
import { Colors } from 'theme/colors';
import { Images } from 'images/index';
import axiosInstance, { createFormData } from 'services';
import { Swiper, SwiperSlide } from 'swiper/react';
import SwiperCore, { Navigation, Pagination } from 'swiper';
import Resizer from 'react-image-file-resizer';
import 'swiper/swiper-bundle.css';

import ImageFormComponent from 'components/Challenge/ImageFormComponent';
import CheckpointEditFormComponent from 'components/Challenge/CheckpointEditFormComponent';
import PrimaryButtonComponent from 'components/PrimaryButtonComponent';
import ConfirmationPopupComponent from 'components/ConfirmationPopupComponent';

SwiperCore.use([Navigation, Pagination]);

const LoadingSpinner = styled(Spin)`
  margin-top: 30px;
`;

const Header = styled(Row)`
  width: 350px;
  margin-left: 15px;
  margin-bottom: 15px;
`;

const Overview = styled(Row)`
  width: 350px;
  margin-left: 15px;
  padding: 0px 10px 10px;

  > h1,
  h2,
  h3,
  h4,
  h5,
  h6 {
    color: ${Colors.white};
  }

  > p {
    margin-bottom: 1rem;
    font-family: Montserrat-Regular;
  }

  > img {
    width: 100%;
  }

  strong {
    font-family: Montserrat-Bold;
  }

  ol,
  ul {
    padding-left: 20px;

    > li {
      padding-left: 5px;
    }
  }
`;

const CheckpointPreview = styled.img`
  height: 237px;
  width: 350px;
  object-fit: contain;
  margin: 0px 15px 20px;
`;

const TrailCard = styled.div`
  background-color: ${Colors.white};
  border-radius: 8px;
  width: 350px;
  margin: 0px 15px 30px;

  .header {
    padding: 10px 15px;

    .indicator {
      background-color: ${Colors.darkGrey};
      border-radius: 50px;
      width: 40px;
      height: 40px;
    }
  }

  .image-container {
    height: 224px;
    width: 100%;

    .trail-image {
      height: 224px;
      width: 100%;
      object-fit: cover;
    }
  }

  .desc {
    padding: 10px 15px;

    > h1,
    h2,
    h3,
    h4,
    h5,
    h6 {
      color: ${Colors.white};
    }

    > p {
      margin-bottom: 0.5rem;
      font-family: Montserrat-Regular;
    }

    > img {
      width: 100%;
    }

    strong {
      font-family: Montserrat-Bold;
    }

    ol,
    ul {
      padding-left: 20px;

      > li {
        padding-left: 5px;
      }
    }
  }
`;

const NoImagePlaceholder = styled(Row)`
  height: 224px;
  width: 100%;
  border: 3px solid ${Colors.white};
  background-color: ${Colors.grey};
`;

const Gallery = styled(Swiper)`
  width: 350px;
  height: 224px;

  .swiper-pagination-bullet {
    background: ${Colors.white};
    border: 2px solid ${Colors.primary};
    opacity: 1;
    height: 10px;
    width: 10px;
  }

  .swiper-pagination-bullet-active {
    background: ${Colors.primary} !important;
  }

  .swiper-button-next {
    color: ${Colors.white};
    height: 30px;

    ::after {
      background-image: url(${Images.rightArrowBordered});
      background-size: contain;
      height: 25px;
      width: 20px;
    }
  }

  .swiper-button-prev {
    color: ${Colors.white};
    height: 30px;

    ::after {
      background-image: url(${Images.leftArrowBordered});
      background-size: contain;
      height: 25px;
      width: 20px;
    }
  }

  .swiper-button-disabled::after {
    content: none;
  }

  .swiper-pagination,
  .swiper-pagination-clickable,
  .swiper-pagination-bullets {
    bottom: 0px !important;
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

const DeleteIcon = styled.div`
  background-color: ${Colors.warning};
  height: 40px;
  width: 40px;
  border-radius: 50px;
  position: absolute;
  bottom: 10px;
  right: 60px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;

  > img {
    height: 20px;
    width: 20px;
  }
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

const InfoSection = styled.div`
  max-width: 500px;

  > div {
    margin-top: 5px;
  }

  .label {
    width: 200px;
    min-width: 200px;
  }
`;

const ParticipateButton = styled.div`
  background: ${Colors.primary};
  padding-left: 25px;
  padding-right: 25px;
  border-radius: 8px;
  height: 46px;
  display: flex;
  align-items: center;
  box-shadow: ${Colors.shadow} 0px 2px 2px 0px;
  cursor: pointer;
`;

function TrailDetailComponent({ challengeId }) {
  const [challenge, setChallenge] = useState(null);
  const [trailLoading, setTrailLoading] = useState(true);
  const [trailList, setTrailList] = useState();

  // for clean up unmount
  const unmounted = useRef(false);

  useEffect(
    () => () => {
      unmounted.current = true;
    },
    [],
  );

  useEffect(() => {
    getTrails();
  }, []);

  const getTrails = () => {
    axiosInstance
      .get(`api/challenge/${challengeId}`)
      .then(res => {
        if (!unmounted.current) {
          setChallenge(res.data.data);
          setTrailList(res.data.data.trails);
        }
      })
      .finally(() => {
        setTrailLoading(false);
      });
  };

  const imageChange = async e => {
    const file = e.target.files[0];
    const newFile = await resizeFile(file);

    axiosInstance
      .post(
        'api/challenge',
        createFormData({
          challenge_id: challenge.challenge_id,
          checkpoint_preview_image: newFile,
        }),
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        },
      )
      .then(res => {
        setChallenge(prevVal => ({
          ...prevVal,
          checkpoint_preview_image: res.data.data.checkpoint_preview_image,
        }));
      });
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

  const TrailCardComponent = ({ trail }) => {
    const [imageIndex, setImageIndex] = useState(0);

    const [selectedImage, setSelectedImage] = useState(null);
    const [selectedDeleteImage, setSelectedDeleteImage] = useState(null);

    const [editModalVisible, setEditModalVisible] = useState(false);
    const [deleteModalVisible, setDeleteModalVisible] = useState(false);

    // trail image
    const [createImageModalVisible, setCreateImageModalVisible] = useState(
      false,
    );
    const [editImageModalVisible, setEditImageModalVisible] = useState(false);
    const [deleteImageModalVisible, setDeleteImageModalVisible] = useState(
      false,
    );

    useEffect(() => {
      if (selectedImage) {
        setEditImageModalVisible(true);
      }
    }, [selectedImage]);

    const deleteTrail = () => {
      axiosInstance.delete(`api/trail/${trail.trail_id}`).then(() => {
        getTrails();
      });
    };

    const deleteImage = () => {
      if (selectedDeleteImage) {
        axiosInstance
          .delete(`api/trail-image/${selectedDeleteImage.image_id}`)
          .then(() => {
            getTrails();
          });
      }
    };

    return (
      <Row wrap={false}>
        <TrailCard>
          <Row wrap={false} justify="space-between" className="header">
            <div>
              <div className="bodyBold cyan-text">
                CHECKPOINT {trail.trail_index}
              </div>
              <div className="bodyBold cyan-text">
                {trail.title.toUpperCase()}
              </div>
            </div>
            <Row
              justify="center"
              align="middle"
              className="indicator white-text h3"
            >
              {trail.trail_index}
            </Row>
          </Row>
          <div className="image-container">
            {trail && trail.images.length ? (
              <Gallery
                spaceBetween={10}
                slidesPerView={1}
                onSlideChange={index => setImageIndex(index.activeIndex)}
                pagination={{ clickable: true }}
                navigation
              >
                {trail.images.map((image, i) => (
                  <SwiperSlide key={i}>
                    <img
                      className="trail-image"
                      onError={e => {
                        e.target.onerror = null;
                        e.target.src = Images.imagePlaceholder;
                      }}
                      src={`${process.env.IMAGE_URL_PREFIX}trail/${
                        image.trail_id
                      }/${image.image_filename}`}
                      alt="trail"
                    />
                    <DeleteIcon
                      onClick={() => {
                        setSelectedDeleteImage(image);
                        setDeleteImageModalVisible(true);
                      }}
                    >
                      <img src={Images.deleteIcon} alt="upload" />
                    </DeleteIcon>
                    <UpdateIcon onClick={() => setSelectedImage(image)}>
                      <img src={Images.editIcon} alt="upload" />
                    </UpdateIcon>
                  </SwiperSlide>
                ))}
              </Gallery>
            ) : (
              <NoImagePlaceholder align="middle" justify="center">
                <Col align="middle">
                  <UploadIcon onClick={() => setCreateImageModalVisible(true)}>
                    <img src={Images.camera} alt="upload" />
                  </UploadIcon>
                  <div
                    className="bodyBold white-text"
                    style={{ marginTop: '5px' }}
                  >
                    Add Image
                  </div>
                </Col>
              </NoImagePlaceholder>
            )}
          </div>
          <div
            className="desc body grey-text"
            dangerouslySetInnerHTML={{
              __html: DOMPurify.sanitize(
                trail.images.length ? trail.images[imageIndex].description : '',
              ),
            }}
          />
          <ConfirmationPopupComponent
            visibility={deleteImageModalVisible}
            dismissModal={() => {
              setDeleteImageModalVisible(false);
            }}
            title="Remove Trail Image"
            message="This action cannot be undone. Do you wish to remove this trail image"
            leftAction={() => deleteImage()}
            rightAction={() => setDeleteImageModalVisible(false)}
          />
        </TrailCard>
        <Row wrap={false} style={{ margin: '0px 10px 20px' }}>
          {challenge.type === 'race' ? (
            <div
              className="bodyBold"
              style={{ width: '280px', marginRight: '30px' }}
            >
              <div className="white-text">Trail Progress Image</div>
              <div
                className={
                  trail.trail_progress_image ? 'white-text' : 'error-text'
                }
                style={{ marginTop: '10px' }}
              >
                {trail.trail_progress_image ? (
                  <img
                    src={`${process.env.IMAGE_URL_PREFIX}trail/${
                      trail.trail_id
                    }/${trail.trail_progress_image}`}
                    alt="progress"
                    style={{
                      height: '167px',
                      width: '100%',
                      objectFit: 'contain',
                    }}
                  />
                ) : (
                  '(none)'
                )}
              </div>
            </div>
          ) : null}
          <InfoSection className="white-text bodyBold">
            <Row wrap={false}>
              <div className="label">MT Point</div>
              <div className="white-text">{trail.moontrekker_point}</div>
            </Row>
            <Row wrap={false}>
              <div className="label">Distance</div>
              <div className="white-text">{trail.distance}km</div>
            </Row>
            <Row wrap={false}>
              <div className="label">QR Value</div>
              <div className="white-text">{trail.station_qr_value || '-'}</div>
            </Row>
            <Row wrap={false}>
              <div className="label">Longitude</div>
              <div className="white-text">{trail.longitude || '-'}</div>
            </Row>
            <Row wrap={false}>
              <div className="label">Latitude</div>
              <div className="white-text">{trail.latitude || '-'}</div>
            </Row>
            <Row
              wrap={false}
              justify="space-between"
              style={{ marginTop: '20px' }}
            >
              <PrimaryButtonComponent
                style={{
                  padding: '0px 30px',
                  marginRight: '10px',
                  width: '100%',
                  display: 'flex',
                  justifyContent: 'center',
                }}
                label="Edit Info"
                onClick={() => setEditModalVisible(true)}
                iconRight={false}
              />
              <PrimaryButtonComponent
                style={{
                  padding: '0px 30px',
                  width: '100%',
                  display: 'flex',
                  justifyContent: 'center',
                }}
                label="Delete Trail"
                onClick={() => setDeleteModalVisible(true)}
                iconRight={false}
              />
            </Row>
            <PrimaryButtonComponent
              style={{
                padding: '0px 30px',
                marginTop: '15px',
                width: '100%',
                display: 'flex',
                justifyContent: 'center',
              }}
              label="Add Trail Image"
              onClick={() => {
                setCreateImageModalVisible(true);
              }}
              iconRight={false}
            />
          </InfoSection>
        </Row>
        <ConfirmationPopupComponent
          visibility={deleteModalVisible}
          dismissModal={() => {
            setDeleteModalVisible(false);
          }}
          title="Remove Trail"
          message="This action cannot be undone. Do you wish to remove this trail"
          leftAction={() => deleteTrail()}
          rightAction={() => setDeleteModalVisible(false)}
        />
        {editModalVisible ? (
          <CheckpointEditFormComponent
            visibility={editModalVisible}
            dismissModal={updated => {
              setEditModalVisible(false);
              if (updated) {
                getTrails();
              }
            }}
            selectedTrail={trail}
            type={challenge.type || 'challenge'}
          />
        ) : null}

        {createImageModalVisible || editImageModalVisible ? (
          <ImageFormComponent
            visibility={createImageModalVisible || editImageModalVisible}
            selectedImage={selectedImage}
            dismissModal={updated => {
              if (editImageModalVisible) {
                setEditImageModalVisible(false);
                setSelectedImage(null);
              }
              if (createImageModalVisible) {
                setCreateImageModalVisible(false);
              }
              if (updated) {
                getTrails();
              }
            }}
            action={createImageModalVisible ? 'create' : 'update'}
            trailId={trail.trail_id}
          />
        ) : null}
      </Row>
    );
  };

  return !trailLoading ? (
    trailList.length ? (
      <div style={{ padding: '20px 20px 10px 10px' }}>
        {challenge &&
        (challenge.type === 'race' || challenge.type === 'training') ? (
          <div>
            <Header className="h2 white-text" justify="center">
              MOONTREKKER TRAIL
            </Header>
            <Row wrap={false}>
              <CheckpointPreview
                src={`${process.env.IMAGE_URL_PREFIX}challenge/${
                  challenge.challenge_id
                }/${challenge.checkpoint_preview_image}`}
                onError={e => {
                  e.target.onerror = null;
                  e.target.src = Images.imagePlaceholder;
                }}
              />
              <input
                accept="image/*"
                className="pic"
                id="trail"
                style={{ display: 'none' }}
                onChange={imageChange}
                type="file"
              />
              <label htmlFor="trail">
                <ParticipateButton
                  style={{
                    padding: '0px 30px',
                    marginLeft: '15px',
                    marginTop: '20px',
                    width: '250px',
                    display: 'flex',
                    justifyContent: 'center',
                  }}
                  className="bodyBold white-text"
                >
                  {challenge.type === 'race'
                    ? 'Update Race Map'
                    : 'Update Training Map'}
                </ParticipateButton>
              </label>
            </Row>
          </div>
        ) : (
          <div>
            <Header className="h2 white-text" justify="center">
              {challenge.title ? challenge.title.toUpperCase() : ''}
            </Header>
            {challenge.trail_overview_html ? (
              <Overview
                className="body white-text"
                dangerouslySetInnerHTML={{
                  __html: DOMPurify.sanitize(challenge.trail_overview_html),
                }}
              />
            ) : null}
          </div>
        )}

        {trailList.map((t, i) => (
          <TrailCardComponent key={i} trail={t} />
        ))}
      </div>
    ) : (
      <Row
        wrap={false}
        justify="center"
        style={{ flex: 1, padding: '100px 20px 30px 10px' }}
      >
        <div className="h2 cyan-text">No Trail Available</div>
      </Row>
    )
  ) : (
    <Row justify="center" style={{ flex: 1 }}>
      <LoadingSpinner size="large" />
    </Row>
  );
}

export default TrailDetailComponent;
