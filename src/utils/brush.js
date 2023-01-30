import makebi from '../assets/img/brush/makebi.png'
import qianbi from '../assets/img/brush/qianbi.png'
import fangtoubi from '../assets/img/brush/fangtoubi.png'
import bishua6 from '../assets/img/brush/shuimo/bishua6.png'
import bishua7 from '../assets/img/brush/shuimo/bishua7.png'
import bishua8 from '../assets/img/brush/shuimo/bishua8.png'
import bishua9 from '../assets/img/brush/shuimo/bishua9.png'
import bishua10 from '../assets/img/brush/shuimo/bishua10.png'
import bishua11 from '../assets/img/brush/shuimo/bishua11.png'
import bishua12 from '../assets/img/brush/shuimo/bishua12.png'
import bishua13 from '../assets/img/brush/shuimo/bishua13.png'
import bishua14 from '../assets/img/brush/shuimo/bishua14.png'
import bishua15 from '../assets/img/brush/shuimo/bishua15.png'
import bishua16 from '../assets/img/brush/shuimo/bishua16.png'
import bishua17 from '../assets/img/brush/shuimo/bishua17.png'
import bishua18 from '../assets/img/brush/shuimo/bishua18.png'
import bishua19 from '../assets/img/brush/shuimo/bishua19.png'
import bishua20 from '../assets/img/brush/shuimo/bishua20.png'
import bishua21 from '../assets/img/brush/shuimo/bishua21.png'
import bishua22 from '../assets/img/brush/shuimo/笔刷墨迹16.png'
import bishua23 from '../assets/img/brush/shuimo/笔刷墨迹17.png'
import bishua24 from '../assets/img/brush/shuimo/笔刷墨迹18.png'
import bishua25 from '../assets/img/brush/shuimo/笔刷墨迹19.png'
import bishua26 from '../assets/img/brush/shuimo/笔刷墨迹20.png'
import bishua27 from '../assets/img/brush/shuimo/笔刷墨迹21.png'
import bishua28 from '../assets/img/brush/shuimo/笔刷墨迹22.png'
import bishua29 from '../assets/img/brush/shuimo/笔刷墨迹23.png'
import bishua30 from '../assets/img/brush/shuimo/笔刷墨迹24.png'
import bishua31 from '../assets/img/brush/shuimo/笔刷墨迹25.png'
import bishua32 from '../assets/img/brush/shuimo/笔刷墨迹26.png'
import bishua33 from '../assets/img/brush/shuimo/笔刷墨迹27.png'
import bishua34 from '../assets/img/brush/shuimo/笔刷墨迹28.png'
import bishua35 from '../assets/img/brush/shuimo/笔刷墨迹29.png'
import bishua36 from '../assets/img/brush/shuimo/笔刷墨迹30.png'
// 铅笔
import qianbi1 from '../assets/img/brush/qianbi/qianbi_1.png'
import qianbi2 from '../assets/img/brush/qianbi/qianbi_2.png'
import qianbi3 from '../assets/img/brush/qianbi/qianbi_3.png'
import qianbi4 from '../assets/img/brush/qianbi/qianbi_4.png'
import qianbi5 from '../assets/img/brush/qianbi/qianbi_5.png'
import qianbi6 from '../assets/img/brush/qianbi/qianbi_6.png'
import qianbi7 from '../assets/img/brush/qianbi/qianbi_7.png'
import qianbi8 from '../assets/img/brush/qianbi/qianbi_8.png'
import qianbi9 from '../assets/img/brush/qianbi/qianbi_9.png'
import qianbi10 from '../assets/img/brush/qianbi/qianbi_10.png'
import qianbi11 from '../assets/img/brush/qianbi/qianbi_11.png'
// 方头笔

/**
 * 笔刷
 */
const brush = [
  {
    name: 'qianbi',
    type: 1,
    img: qianbi,
    icon: '#iconqianbi',
    spacing: 1,
    category: '勾线',
    lineWidthTimes: 1,
    visible: true,
  },
  {
    name: 'makebi',
    type: 4,
    img: makebi,
    icon: '#iconmakebi',
    spacing: 0.1,
    category: '基本',
    lineWidthTimes: 3,
    visible: true,
  },
  {
    name: 'fangtoubi',
    type: 5,
    img: fangtoubi,
    icon: '#iconhuabi1',
    spacing: 1,
    category: '基本',
    lineWidthTimes: 1,
    visible: true,
  },
  {
    name: 'bishua6',
    type: 6,
    img: bishua6,
    icon: '#iconbishuamoji96',
    spacing: 1,
    category: '水墨',
    lineWidthTimes: 1,
    visible: false,
  },
  {
    name: 'bishua7',
    type: 7,
    img: bishua7,
    icon: '#iconbishuamoji98',
    spacing: 1,
    category: '水墨',
    lineWidthTimes: 1,
    visible: false,
  },
  {
    name: 'bishua8',
    type: 8,
    img: bishua8,
    icon: '#iconbishuamoji1',
    spacing: 1,
    category: '水墨',
    lineWidthTimes: 1,
    visible: false,
  },
  {
    name: 'bishua9',
    type: 9,
    img: bishua9,
    icon: '#iconbishuamoji2',
    spacing: 1,
    category: '水墨',
    lineWidthTimes: 1,
    visible: false,
  },
  {
    name: 'bishua10',
    type: 10,
    img: bishua10,
    icon: '#iconbishuamoji3',
    spacing: 1,
    category: '水墨',
    lineWidthTimes: 1,
    visible: false,
  },
  {
    name: 'bishua11',
    type: 11,
    img: bishua11,
    icon: '#iconbishuamoji4',
    spacing: 1,
    category: '水墨',
    lineWidthTimes: 1,
    visible: false,
  },
  {
    name: 'bishua12',
    type: 12,
    img: bishua12,
    icon: '#iconbishuamoji5',
    spacing: 1,
    category: '水墨',
    lineWidthTimes: 1,
    visible: false,
  },
  {
    name: 'bishua13',
    type: 13,
    img: bishua13,
    icon: '#iconbishuamoji7',
    spacing: 1,
    category: '水墨',
    lineWidthTimes: 1,
    visible: false,
  },
  {
    name: 'bishua14',
    type: 14,
    img: bishua14,
    icon: '#iconbishuamoji6',
    spacing: 1,
    category: '水墨',
    lineWidthTimes: 1,
    visible: false,
  },
  {
    name: 'bishua15',
    type: 15,
    img: bishua15,
    icon: '#iconbishuamoji8',
    spacing: 1,
    category: '水墨',
    lineWidthTimes: 1,
    visible: false,
  },
  {
    name: 'bishua16',
    type: 16,
    img: bishua16,
    icon: '#iconbishuamoji9',
    spacing: 1,
    category: '水墨',
    lineWidthTimes: 1,
    visible: false,
  },
  {
    name: 'bishua17',
    type: 17,
    img: bishua17,
    icon: '#iconbishuamoji10',
    spacing: 1,
    category: '水墨',
    lineWidthTimes: 1,
    visible: false,
  },
  {
    name: 'bishua18',
    type: 18,
    img: bishua18,
    icon: '#iconbishuamoji11',
    spacing: 1,
    category: '水墨',
    lineWidthTimes: 1,
    visible: false,
  },
  {
    name: 'bishua19',
    type: 19,
    img: bishua19,
    icon: '#iconbishuamoji12',
    spacing: 1,
    category: '水墨',
    lineWidthTimes: 1,
    visible: false,
  },
  {
    name: 'bishua20',
    type: 20,
    img: bishua20,
    icon: '#iconbishuamoji14',
    spacing: 1,
    category: '水墨',
    lineWidthTimes: 1,
    visible: false,
  },
  {
    name: 'bishua21',
    type: 21,
    img: bishua21,
    icon: '#iconbishuamoji15',
    spacing: 1,
    category: '水墨',
    lineWidthTimes: 1,
    visible: false,
  },
  {
    name: 'bishua22',
    type: 22,
    img: bishua22,
    icon: '#iconbishuamoji16',
    spacing: 1,
    category: '水墨',
    lineWidthTimes: 1,
    visible: false,
  },
  {
    name: 'bishua23',
    type: 23,
    img: bishua23,
    icon: '#iconbishuamoji17',
    spacing: 1,
    category: '水墨',
    lineWidthTimes: 1,
    visible: false,
  },
  {
    name: 'bishua24',
    type: 24,
    img: bishua24,
    icon: '#iconbishuamoji18',
    spacing: 1,
    category: '水墨',
    lineWidthTimes: 1,
    visible: false,
  },
  {
    name: 'bishua25',
    type: 25,
    img: bishua25,
    icon: '#iconbishuamoji19',
    spacing: 1,
    category: '水墨',
    lineWidthTimes: 1,
    visible: false,
  },
  {
    name: 'bishua26',
    type: 26,
    img: bishua26,
    icon: '#iconbishuamoji20',
    spacing: 1,
    category: '水墨',
    lineWidthTimes: 1,
    visible: false,
  },
  {
    name: 'bishua27',
    type: 27,
    img: bishua27,
    icon: '#iconbishuamoji21',
    spacing: 1,
    category: '水墨',
    lineWidthTimes: 1,
    visible: false,
  },
  {
    name: 'bishua28',
    type: 28,
    img: bishua28,
    icon: '#iconbishuamoji22',
    spacing: 1,
    category: '水墨',
    lineWidthTimes: 1,
    visible: false,
  },
  {
    name: 'bishua29',
    type: 29,
    img: bishua29,
    icon: '#iconbishuamoji23',
    spacing: 1,
    category: '水墨',
    lineWidthTimes: 1,
    visible: false,
  },
  {
    name: 'bishua30',
    type: 30,
    img: bishua30,
    icon: '#iconbishuamoji24',
    spacing: 1,
    category: '水墨',
    lineWidthTimes: 1,
    visible: false,
  },
  {
    name: 'bishua31',
    type: 31,
    img: bishua31,
    icon: '#iconbishuamoji25',
    spacing: 1,
    category: '水墨',
    lineWidthTimes: 1,
    visible: false,
  },
  {
    name: 'bishua32',
    type: 32,
    img: bishua32,
    icon: '#iconbishuamoji26',
    spacing: 1,
    category: '水墨',
    lineWidthTimes: 1,
    visible: false,
  },
  {
    name: 'bishua33',
    type: 33,
    img: bishua33,
    icon: '#iconbishuamoji27',
    spacing: 1,
    category: '水墨',
    lineWidthTimes: 1,
    visible: false,
  },
  {
    name: 'bishua34',
    type: 34,
    img: bishua34,
    icon: '#iconbishuamoji28',
    spacing: 1,
    category: '水墨',
    lineWidthTimes: 1,
    visible: false,
  },
  {
    name: 'bishua35',
    type: 35,
    img: bishua35,
    icon: '#iconbishuamoji29',
    spacing: 1,
    category: '水墨',
    lineWidthTimes: 1,
    visible: false,
  },
  {
    name: 'bishua36',
    type: 36,
    img: bishua36,
    icon: '#iconbishuamoji30',
    spacing: 1,
    category: '水墨',
    lineWidthTimes: 1,
    visible: false,
  },
  {
    name: 'qianbi1',
    type: 37,
    img: qianbi1,
    icon: '',
    spacing: 0.2,
    category: '铅笔',
    lineWidthTimes: 2,
    visible: true,
  },
  {
    name: 'qianbi2',
    type: 38,
    img: qianbi2,
    icon: '',
    spacing: 0.2,
    category: '铅笔',
    lineWidthTimes: 2,
    visible: true,
  },
  {
    name: 'qianbi3',
    type: 39,
    img: qianbi3,
    icon: '',
    spacing: 0.2,
    category: '铅笔',
    lineWidthTimes: 4,
    visible: true,
  },
  {
    name: 'qianbi4',
    type: 40,
    img: qianbi4,
    icon: '',
    spacing: 0.2,
    category: '铅笔',
    lineWidthTimes: 5,
    visible: true,
  },
  {
    name: 'qianbi5',
    type: 41,
    img: qianbi5,
    icon: '',
    spacing: 0.3,
    category: '铅笔',
    lineWidthTimes: 5,
    visible: true,
  },
  {
    name: 'qianbi6',
    type: 42,
    img: qianbi6,
    icon: '',
    spacing: 0.3,
    category: '铅笔',
    lineWidthTimes: 5,
    visible: true,
  },
  {
    name: 'qianbi7',
    type: 43,
    img: qianbi7,
    icon: '',
    spacing: 0.5,
    category: '铅笔',
    lineWidthTimes: 5,
    visible: true,
  },
  {
    name: 'qianbi8',
    type: 44,
    img: qianbi8,
    icon: '',
    spacing: 0.5,
    category: '铅笔',
    lineWidthTimes: 5,
    visible: true,
  },
  {
    name: 'qianbi9',
    type: 45,
    img: qianbi9,
    icon: '',
    spacing: 0.5,
    category: '铅笔',
    lineWidthTimes: 5,
    visible: true,
  },
  {
    name: 'qianbi10',
    type: 46,
    img: qianbi10,
    icon: '',
    spacing: 0.5,
    category: '铅笔',
    lineWidthTimes: 5,
    visible: true,
  },
  {
    name: 'qianbi11',
    type: 47,
    img: qianbi11,
    icon: '',
    spacing: 0.5,
    category: '铅笔',
    lineWidthTimes: 5,
    visible: true,
  },
]
export default brush