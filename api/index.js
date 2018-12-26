import Ajax from '../utils/rp';
import config from '../config';
const ajax = new Ajax();

/*
* demo
*/

export const demo = ajax.get(config.demo)
