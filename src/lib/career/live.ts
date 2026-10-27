import { getCollection, render } from 'astro:content'
import { createCareer } from './index'

export const career = createCareer({ getCollection, render })
