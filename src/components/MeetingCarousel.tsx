import React from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { EffectCoverflow, Pagination } from 'swiper';
import 'swiper/css';
import 'swiper/css/effect-coverflow';
import 'swiper/css/pagination';
import './MeetingCarousel.css';

const MeetingCarousel: React.FC = () => {
  const meetUrl = import.meta.env.VITE_MEET_URL;
  const teamsUrl = import.meta.env.VITE_TEAMS_URL;
  const zoomUrl = import.meta.env.VITE_ZOOM_URL;

  return (
    <Swiper
      modules={[EffectCoverflow, Pagination]}
      effect="coverflow"
      grabCursor
      centeredSlides
      slidesPerView="auto"
      loop
      spaceBetween={40}
      pagination={{ clickable: true }}
      coverflowEffect={{
        rotate: 0,
        stretch: 0,
        depth: 100,
        modifier: 2,
        slideShadows: false,
      }}
      className="riunioni-swiper"
    >
      <SwiperSlide className="swiper-slide--riunione1">
        <a href={meetUrl} target="_blank" rel="noopener noreferrer">
          <img src="/meet.png" alt="Google Meet" />
        </a>
      </SwiperSlide>
      <SwiperSlide className="swiper-slide--riunione2">
        <a href={teamsUrl} target="_blank" rel="noopener noreferrer">
          <img src="/teams.png" alt="Microsoft Teams" />
        </a>
      </SwiperSlide>
      <SwiperSlide className="swiper-slide--riunione3">
        <a href={zoomUrl} target="_blank" rel="noopener noreferrer">
          <img src="/zoom.png" alt="Zoom" />
        </a>
      </SwiperSlide>
    </Swiper>
  );
};

export default MeetingCarousel;
