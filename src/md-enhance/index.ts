import * as emoji from 'markdown-it-emoji';
import { containerPlugin } from './container';
import checkboxPlugin from './checkbox';


export default [
	emoji.full,
	containerPlugin,
	checkboxPlugin
];