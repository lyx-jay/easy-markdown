// @ts-nocheck
import * as emoji from 'markdown-it-emoji';
import { containerPlugin } from './container';


export default [
	emoji.full,
	containerPlugin
];