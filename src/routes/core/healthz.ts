import express from 'express';
import controllers from '../../controllers/core/index'

export default function Healthz () {
  const router = express.Router();

  router.get( '/', controllers.healthz )
  return router;
}