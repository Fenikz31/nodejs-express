export default function Info () {
  return ( req, res ) => {
    res.status( 200 ).json({
      success: true,
      message: '',
      data: {
        name: process.env.npm_package_name,
        version: process.env.npm_package_version
      }
    });
  }
}