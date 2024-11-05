import { Router } from 'express';

import stripeRouter from './stripe/stripe.router'

const router = Router()

router.use('/stripe', stripeRouter)

export default router;