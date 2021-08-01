module.exports = {
  plugins: [
    require('postcss-px2unit')({
      rootValue: 0.5,
      unit: 'rpx',
      propList: ['*'],
    }),
  ],
};
