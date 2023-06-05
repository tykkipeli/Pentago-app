import icon1 from '../assets/icon_1.png';
import icon2 from '../assets/icon_2.png';
import icon3 from '../assets/icon_3.png';
import icon4 from '../assets/icon_4.png';
import icon5 from '../assets/icon_5.png';
import icon6 from '../assets/icon_6.png';
import icon7 from '../assets/icon_7.png';
import icon8 from '../assets/icon_8.png';
import icon_newplayer from '../assets/icon_newplayer.png';

export function getIcon(rating, numGames) {
  if (numGames < 10) {
    return icon_newplayer;
  }
  if (rating < 1000) {
    return icon1;
  } else if (rating < 1200) {
    return icon2;
  } else if (rating < 1400) {
    return icon3;
  } else if (rating < 1600) {
    return icon4;
  } else if (rating < 1800) {
    return icon5;
  } else if (rating < 2000) {
    return icon6;
  } else if (rating < 2200) {
    return icon7;
  } else {
    return icon8;
  }
}
