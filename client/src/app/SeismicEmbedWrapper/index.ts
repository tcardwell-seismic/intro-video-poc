export { };

declare global {
    let MantleUI: any;
    let registerLoader: (cb: (x: string) => Promise<any>) => void;
    let __seismicLoadPackage__: (x: string) => Promise<any>;
    let __webpack_public_path__: string;
}

registerLoader(async (publicPath: string) => {
    // https://webpack.js.org/guides/public-path/#on-the-fly
    __webpack_public_path__ = publicPath + '/';
    // Mantle needs to be loaded before the wrapper.
    await (window.MantleUI || __seismicLoadPackage__('@seismic/mantle@2.7.1'));
    return import('./Wrapper');
});
