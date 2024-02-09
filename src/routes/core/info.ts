import express from 'express';
import controllers from '../../controllers/core/index'

export default function Info () {
  const router = express.Router();
  router.get( '/', controllers.info );
  return router;
}