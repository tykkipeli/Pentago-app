import icon1 from '../assets/icon1.png';
import icon2 from '../assets/icon2.png';
import icon3 from '../assets/icon3.png';
import icon4 from '../assets/icon4.png';
import icon5 from '../assets/icon5.png';
import icon6 from '../assets/icon6.png';
import icon7 from '../assets/icon7.png';
import icon8 from '../assets/icon8.png';
import icon_newplayer from '../assets/new.png';

export function getIcon(rating, numGames) {
  if (numGames < 10) {
    return icon_newplayer;
  }
  if (rating < 1000) {
    return icon8;
  } else if (rating < 1200) {
    return icon7;
  } else if (rating < 1400) {
    return icon6;
  } else if (rating < 1600) {
    return icon5;
  } else if (rating < 1800) {
    return icon4;
  } else if (rating < 2000) {
    return icon3;
  } else if (rating < 2200) {
    return icon2;
  } else {
    return icon1;
  }
}
