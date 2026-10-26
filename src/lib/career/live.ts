import { getCollection } from 'astro:content'
import { createCareer } from './index'

export const career = createCareer({ getCollection })
