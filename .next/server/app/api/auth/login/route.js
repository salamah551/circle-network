"use strict";
/*
 * ATTENTION: An "eval-source-map" devtool has been used.
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file with attached SourceMaps in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
(() => {
var exports = {};
exports.id = "app/api/auth/login/route";
exports.ids = ["app/api/auth/login/route"];
exports.modules = {

/***/ "next/dist/compiled/next-server/app-page.runtime.dev.js":
/*!*************************************************************************!*\
  !*** external "next/dist/compiled/next-server/app-page.runtime.dev.js" ***!
  \*************************************************************************/
/***/ ((module) => {

module.exports = require("next/dist/compiled/next-server/app-page.runtime.dev.js");

/***/ }),

/***/ "next/dist/compiled/next-server/app-route.runtime.dev.js":
/*!**************************************************************************!*\
  !*** external "next/dist/compiled/next-server/app-route.runtime.dev.js" ***!
  \**************************************************************************/
/***/ ((module) => {

module.exports = require("next/dist/compiled/next-server/app-route.runtime.dev.js");

/***/ }),

/***/ "http":
/*!***********************!*\
  !*** external "http" ***!
  \***********************/
/***/ ((module) => {

module.exports = require("http");

/***/ }),

/***/ "https":
/*!************************!*\
  !*** external "https" ***!
  \************************/
/***/ ((module) => {

module.exports = require("https");

/***/ }),

/***/ "punycode":
/*!***************************!*\
  !*** external "punycode" ***!
  \***************************/
/***/ ((module) => {

module.exports = require("punycode");

/***/ }),

/***/ "stream":
/*!*************************!*\
  !*** external "stream" ***!
  \*************************/
/***/ ((module) => {

module.exports = require("stream");

/***/ }),

/***/ "url":
/*!**********************!*\
  !*** external "url" ***!
  \**********************/
/***/ ((module) => {

module.exports = require("url");

/***/ }),

/***/ "zlib":
/*!***********************!*\
  !*** external "zlib" ***!
  \***********************/
/***/ ((module) => {

module.exports = require("zlib");

/***/ }),

/***/ "(rsc)/./node_modules/next/dist/build/webpack/loaders/next-app-loader.js?name=app%2Fapi%2Fauth%2Flogin%2Froute&page=%2Fapi%2Fauth%2Flogin%2Froute&appPaths=&pagePath=private-next-app-dir%2Fapi%2Fauth%2Flogin%2Froute.js&appDir=C%3A%5CUsers%5Chamza%5Ccircle-network%5Capp&pageExtensions=tsx&pageExtensions=ts&pageExtensions=jsx&pageExtensions=js&rootDir=C%3A%5CUsers%5Chamza%5Ccircle-network&isDev=true&tsconfigPath=tsconfig.json&basePath=&assetPrefix=&nextConfigOutput=&preferredRegion=&middlewareConfig=e30%3D!":
/*!******************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************!*\
  !*** ./node_modules/next/dist/build/webpack/loaders/next-app-loader.js?name=app%2Fapi%2Fauth%2Flogin%2Froute&page=%2Fapi%2Fauth%2Flogin%2Froute&appPaths=&pagePath=private-next-app-dir%2Fapi%2Fauth%2Flogin%2Froute.js&appDir=C%3A%5CUsers%5Chamza%5Ccircle-network%5Capp&pageExtensions=tsx&pageExtensions=ts&pageExtensions=jsx&pageExtensions=js&rootDir=C%3A%5CUsers%5Chamza%5Ccircle-network&isDev=true&tsconfigPath=tsconfig.json&basePath=&assetPrefix=&nextConfigOutput=&preferredRegion=&middlewareConfig=e30%3D! ***!
  \******************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   originalPathname: () => (/* binding */ originalPathname),\n/* harmony export */   patchFetch: () => (/* binding */ patchFetch),\n/* harmony export */   requestAsyncStorage: () => (/* binding */ requestAsyncStorage),\n/* harmony export */   routeModule: () => (/* binding */ routeModule),\n/* harmony export */   serverHooks: () => (/* binding */ serverHooks),\n/* harmony export */   staticGenerationAsyncStorage: () => (/* binding */ staticGenerationAsyncStorage)\n/* harmony export */ });\n/* harmony import */ var next_dist_server_future_route_modules_app_route_module_compiled__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! next/dist/server/future/route-modules/app-route/module.compiled */ \"(rsc)/./node_modules/next/dist/server/future/route-modules/app-route/module.compiled.js\");\n/* harmony import */ var next_dist_server_future_route_modules_app_route_module_compiled__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(next_dist_server_future_route_modules_app_route_module_compiled__WEBPACK_IMPORTED_MODULE_0__);\n/* harmony import */ var next_dist_server_future_route_kind__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! next/dist/server/future/route-kind */ \"(rsc)/./node_modules/next/dist/server/future/route-kind.js\");\n/* harmony import */ var next_dist_server_lib_patch_fetch__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! next/dist/server/lib/patch-fetch */ \"(rsc)/./node_modules/next/dist/server/lib/patch-fetch.js\");\n/* harmony import */ var next_dist_server_lib_patch_fetch__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(next_dist_server_lib_patch_fetch__WEBPACK_IMPORTED_MODULE_2__);\n/* harmony import */ var C_Users_hamza_circle_network_app_api_auth_login_route_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./app/api/auth/login/route.js */ \"(rsc)/./app/api/auth/login/route.js\");\n\n\n\n\n// We inject the nextConfigOutput here so that we can use them in the route\n// module.\nconst nextConfigOutput = \"\"\nconst routeModule = new next_dist_server_future_route_modules_app_route_module_compiled__WEBPACK_IMPORTED_MODULE_0__.AppRouteRouteModule({\n    definition: {\n        kind: next_dist_server_future_route_kind__WEBPACK_IMPORTED_MODULE_1__.RouteKind.APP_ROUTE,\n        page: \"/api/auth/login/route\",\n        pathname: \"/api/auth/login\",\n        filename: \"route\",\n        bundlePath: \"app/api/auth/login/route\"\n    },\n    resolvedPagePath: \"C:\\\\Users\\\\hamza\\\\circle-network\\\\app\\\\api\\\\auth\\\\login\\\\route.js\",\n    nextConfigOutput,\n    userland: C_Users_hamza_circle_network_app_api_auth_login_route_js__WEBPACK_IMPORTED_MODULE_3__\n});\n// Pull out the exports that we need to expose from the module. This should\n// be eliminated when we've moved the other routes to the new format. These\n// are used to hook into the route.\nconst { requestAsyncStorage, staticGenerationAsyncStorage, serverHooks } = routeModule;\nconst originalPathname = \"/api/auth/login/route\";\nfunction patchFetch() {\n    return (0,next_dist_server_lib_patch_fetch__WEBPACK_IMPORTED_MODULE_2__.patchFetch)({\n        serverHooks,\n        staticGenerationAsyncStorage\n    });\n}\n\n\n//# sourceMappingURL=app-route.js.map//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHJzYykvLi9ub2RlX21vZHVsZXMvbmV4dC9kaXN0L2J1aWxkL3dlYnBhY2svbG9hZGVycy9uZXh0LWFwcC1sb2FkZXIuanM/bmFtZT1hcHAlMkZhcGklMkZhdXRoJTJGbG9naW4lMkZyb3V0ZSZwYWdlPSUyRmFwaSUyRmF1dGglMkZsb2dpbiUyRnJvdXRlJmFwcFBhdGhzPSZwYWdlUGF0aD1wcml2YXRlLW5leHQtYXBwLWRpciUyRmFwaSUyRmF1dGglMkZsb2dpbiUyRnJvdXRlLmpzJmFwcERpcj1DJTNBJTVDVXNlcnMlNUNoYW16YSU1Q2NpcmNsZS1uZXR3b3JrJTVDYXBwJnBhZ2VFeHRlbnNpb25zPXRzeCZwYWdlRXh0ZW5zaW9ucz10cyZwYWdlRXh0ZW5zaW9ucz1qc3gmcGFnZUV4dGVuc2lvbnM9anMmcm9vdERpcj1DJTNBJTVDVXNlcnMlNUNoYW16YSU1Q2NpcmNsZS1uZXR3b3JrJmlzRGV2PXRydWUmdHNjb25maWdQYXRoPXRzY29uZmlnLmpzb24mYmFzZVBhdGg9JmFzc2V0UHJlZml4PSZuZXh0Q29uZmlnT3V0cHV0PSZwcmVmZXJyZWRSZWdpb249Jm1pZGRsZXdhcmVDb25maWc9ZTMwJTNEISIsIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7QUFBc0c7QUFDdkM7QUFDYztBQUNpQjtBQUM5RjtBQUNBO0FBQ0E7QUFDQSx3QkFBd0IsZ0hBQW1CO0FBQzNDO0FBQ0EsY0FBYyx5RUFBUztBQUN2QjtBQUNBO0FBQ0E7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUNBO0FBQ0EsWUFBWTtBQUNaLENBQUM7QUFDRDtBQUNBO0FBQ0E7QUFDQSxRQUFRLGlFQUFpRTtBQUN6RTtBQUNBO0FBQ0EsV0FBVyw0RUFBVztBQUN0QjtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQ3VIOztBQUV2SCIsInNvdXJjZXMiOlsid2VicGFjazovL2NpcmNsZS1uZXR3b3JrLz83ZWFiIl0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IEFwcFJvdXRlUm91dGVNb2R1bGUgfSBmcm9tIFwibmV4dC9kaXN0L3NlcnZlci9mdXR1cmUvcm91dGUtbW9kdWxlcy9hcHAtcm91dGUvbW9kdWxlLmNvbXBpbGVkXCI7XG5pbXBvcnQgeyBSb3V0ZUtpbmQgfSBmcm9tIFwibmV4dC9kaXN0L3NlcnZlci9mdXR1cmUvcm91dGUta2luZFwiO1xuaW1wb3J0IHsgcGF0Y2hGZXRjaCBhcyBfcGF0Y2hGZXRjaCB9IGZyb20gXCJuZXh0L2Rpc3Qvc2VydmVyL2xpYi9wYXRjaC1mZXRjaFwiO1xuaW1wb3J0ICogYXMgdXNlcmxhbmQgZnJvbSBcIkM6XFxcXFVzZXJzXFxcXGhhbXphXFxcXGNpcmNsZS1uZXR3b3JrXFxcXGFwcFxcXFxhcGlcXFxcYXV0aFxcXFxsb2dpblxcXFxyb3V0ZS5qc1wiO1xuLy8gV2UgaW5qZWN0IHRoZSBuZXh0Q29uZmlnT3V0cHV0IGhlcmUgc28gdGhhdCB3ZSBjYW4gdXNlIHRoZW0gaW4gdGhlIHJvdXRlXG4vLyBtb2R1bGUuXG5jb25zdCBuZXh0Q29uZmlnT3V0cHV0ID0gXCJcIlxuY29uc3Qgcm91dGVNb2R1bGUgPSBuZXcgQXBwUm91dGVSb3V0ZU1vZHVsZSh7XG4gICAgZGVmaW5pdGlvbjoge1xuICAgICAgICBraW5kOiBSb3V0ZUtpbmQuQVBQX1JPVVRFLFxuICAgICAgICBwYWdlOiBcIi9hcGkvYXV0aC9sb2dpbi9yb3V0ZVwiLFxuICAgICAgICBwYXRobmFtZTogXCIvYXBpL2F1dGgvbG9naW5cIixcbiAgICAgICAgZmlsZW5hbWU6IFwicm91dGVcIixcbiAgICAgICAgYnVuZGxlUGF0aDogXCJhcHAvYXBpL2F1dGgvbG9naW4vcm91dGVcIlxuICAgIH0sXG4gICAgcmVzb2x2ZWRQYWdlUGF0aDogXCJDOlxcXFxVc2Vyc1xcXFxoYW16YVxcXFxjaXJjbGUtbmV0d29ya1xcXFxhcHBcXFxcYXBpXFxcXGF1dGhcXFxcbG9naW5cXFxccm91dGUuanNcIixcbiAgICBuZXh0Q29uZmlnT3V0cHV0LFxuICAgIHVzZXJsYW5kXG59KTtcbi8vIFB1bGwgb3V0IHRoZSBleHBvcnRzIHRoYXQgd2UgbmVlZCB0byBleHBvc2UgZnJvbSB0aGUgbW9kdWxlLiBUaGlzIHNob3VsZFxuLy8gYmUgZWxpbWluYXRlZCB3aGVuIHdlJ3ZlIG1vdmVkIHRoZSBvdGhlciByb3V0ZXMgdG8gdGhlIG5ldyBmb3JtYXQuIFRoZXNlXG4vLyBhcmUgdXNlZCB0byBob29rIGludG8gdGhlIHJvdXRlLlxuY29uc3QgeyByZXF1ZXN0QXN5bmNTdG9yYWdlLCBzdGF0aWNHZW5lcmF0aW9uQXN5bmNTdG9yYWdlLCBzZXJ2ZXJIb29rcyB9ID0gcm91dGVNb2R1bGU7XG5jb25zdCBvcmlnaW5hbFBhdGhuYW1lID0gXCIvYXBpL2F1dGgvbG9naW4vcm91dGVcIjtcbmZ1bmN0aW9uIHBhdGNoRmV0Y2goKSB7XG4gICAgcmV0dXJuIF9wYXRjaEZldGNoKHtcbiAgICAgICAgc2VydmVySG9va3MsXG4gICAgICAgIHN0YXRpY0dlbmVyYXRpb25Bc3luY1N0b3JhZ2VcbiAgICB9KTtcbn1cbmV4cG9ydCB7IHJvdXRlTW9kdWxlLCByZXF1ZXN0QXN5bmNTdG9yYWdlLCBzdGF0aWNHZW5lcmF0aW9uQXN5bmNTdG9yYWdlLCBzZXJ2ZXJIb29rcywgb3JpZ2luYWxQYXRobmFtZSwgcGF0Y2hGZXRjaCwgIH07XG5cbi8vIyBzb3VyY2VNYXBwaW5nVVJMPWFwcC1yb3V0ZS5qcy5tYXAiXSwibmFtZXMiOltdLCJzb3VyY2VSb290IjoiIn0=\n//# sourceURL=webpack-internal:///(rsc)/./node_modules/next/dist/build/webpack/loaders/next-app-loader.js?name=app%2Fapi%2Fauth%2Flogin%2Froute&page=%2Fapi%2Fauth%2Flogin%2Froute&appPaths=&pagePath=private-next-app-dir%2Fapi%2Fauth%2Flogin%2Froute.js&appDir=C%3A%5CUsers%5Chamza%5Ccircle-network%5Capp&pageExtensions=tsx&pageExtensions=ts&pageExtensions=jsx&pageExtensions=js&rootDir=C%3A%5CUsers%5Chamza%5Ccircle-network&isDev=true&tsconfigPath=tsconfig.json&basePath=&assetPrefix=&nextConfigOutput=&preferredRegion=&middlewareConfig=e30%3D!\n");

/***/ }),

/***/ "(rsc)/./app/api/auth/login/route.js":
/*!*************************************!*\
  !*** ./app/api/auth/login/route.js ***!
  \*************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   POST: () => (/* binding */ POST)\n/* harmony export */ });\n/* harmony import */ var next_server__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! next/server */ \"(rsc)/./node_modules/next/dist/api/server.js\");\n/* harmony import */ var _supabase_supabase_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @supabase/supabase-js */ \"(rsc)/./node_modules/@supabase/supabase-js/dist/module/index.js\");\n\n\nasync function POST(request) {\n    // Initialize at runtime\n    const supabaseAdmin = (0,_supabase_supabase_js__WEBPACK_IMPORTED_MODULE_1__.createClient)(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);\n    try {\n        const { email } = await request.json();\n        if (!email) {\n            return next_server__WEBPACK_IMPORTED_MODULE_0__.NextResponse.json({\n                error: \"Email is required\"\n            }, {\n                status: 400\n            });\n        }\n        const emailLower = email.toLowerCase().trim();\n        // ✅ Check if email belongs to an admin user\n        const { data: adminProfile } = await supabaseAdmin.from(\"profiles\").select(\"is_admin\").eq(\"email\", emailLower).single();\n        const isAdminEmail = adminProfile?.is_admin === true;\n        if (!isAdminEmail) {\n            // Check if user exists for non-admin emails\n            const { data: { users }, error: userError } = await supabaseAdmin.auth.admin.listUsers();\n            const userExists = users?.some((user)=>user.email?.toLowerCase() === emailLower);\n            if (!userError && !userExists) {\n                return next_server__WEBPACK_IMPORTED_MODULE_0__.NextResponse.json({\n                    error: \"No account found with this email\"\n                }, {\n                    status: 404\n                });\n            }\n        }\n        // Send magic link using Supabase Auth\n        const { error: magicLinkError } = await supabaseAdmin.auth.signInWithOtp({\n            email: emailLower,\n            options: {\n                emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback`,\n                shouldCreateUser: isAdminEmail // ✅ Auto-create for admin emails\n            }\n        });\n        if (magicLinkError) {\n            console.error(\"Magic link error:\", magicLinkError);\n            return next_server__WEBPACK_IMPORTED_MODULE_0__.NextResponse.json({\n                error: \"Failed to send magic link\"\n            }, {\n                status: 500\n            });\n        }\n        return next_server__WEBPACK_IMPORTED_MODULE_0__.NextResponse.json({\n            success: true,\n            message: \"Magic link sent successfully\"\n        });\n    } catch (error) {\n        console.error(\"Login error:\", error);\n        return next_server__WEBPACK_IMPORTED_MODULE_0__.NextResponse.json({\n            error: \"Internal server error\"\n        }, {\n            status: 500\n        });\n    }\n}\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHJzYykvLi9hcHAvYXBpL2F1dGgvbG9naW4vcm91dGUuanMiLCJtYXBwaW5ncyI6Ijs7Ozs7O0FBQTJDO0FBQ1U7QUFJOUMsZUFBZUUsS0FBS0MsT0FBTztJQUNoQyx3QkFBd0I7SUFDeEIsTUFBTUMsZ0JBQWdCSCxtRUFBWUEsQ0FDaENJLFFBQVFDLEdBQUcsQ0FBQ0Msd0JBQXdCLEVBQ3BDRixRQUFRQyxHQUFHLENBQUNFLHlCQUF5QjtJQUV2QyxJQUFJO1FBQ0YsTUFBTSxFQUFFQyxLQUFLLEVBQUUsR0FBRyxNQUFNTixRQUFRTyxJQUFJO1FBRXBDLElBQUksQ0FBQ0QsT0FBTztZQUNWLE9BQU9ULHFEQUFZQSxDQUFDVSxJQUFJLENBQ3RCO2dCQUFFQyxPQUFPO1lBQW9CLEdBQzdCO2dCQUFFQyxRQUFRO1lBQUk7UUFFbEI7UUFFQSxNQUFNQyxhQUFhSixNQUFNSyxXQUFXLEdBQUdDLElBQUk7UUFFM0MsNENBQTRDO1FBQzVDLE1BQU0sRUFBRUMsTUFBTUMsWUFBWSxFQUFFLEdBQUcsTUFBTWIsY0FDbENjLElBQUksQ0FBQyxZQUNMQyxNQUFNLENBQUMsWUFDUEMsRUFBRSxDQUFDLFNBQVNQLFlBQ1pRLE1BQU07UUFFVCxNQUFNQyxlQUFlTCxjQUFjTSxhQUFhO1FBRWhELElBQUksQ0FBQ0QsY0FBYztZQUNqQiw0Q0FBNEM7WUFDNUMsTUFBTSxFQUFFTixNQUFNLEVBQUVRLEtBQUssRUFBRSxFQUFFYixPQUFPYyxTQUFTLEVBQUUsR0FBRyxNQUFNckIsY0FBY3NCLElBQUksQ0FBQ0MsS0FBSyxDQUFDQyxTQUFTO1lBRXRGLE1BQU1DLGFBQWFMLE9BQU9NLEtBQUtDLENBQUFBLE9BQVFBLEtBQUt0QixLQUFLLEVBQUVLLGtCQUFrQkQ7WUFFckUsSUFBSSxDQUFDWSxhQUFhLENBQUNJLFlBQVk7Z0JBQzdCLE9BQU83QixxREFBWUEsQ0FBQ1UsSUFBSSxDQUN0QjtvQkFBRUMsT0FBTztnQkFBbUMsR0FDNUM7b0JBQUVDLFFBQVE7Z0JBQUk7WUFFbEI7UUFDRjtRQUVBLHNDQUFzQztRQUN0QyxNQUFNLEVBQUVELE9BQU9xQixjQUFjLEVBQUUsR0FBRyxNQUFNNUIsY0FBY3NCLElBQUksQ0FBQ08sYUFBYSxDQUFDO1lBQ3ZFeEIsT0FBT0k7WUFDUHFCLFNBQVM7Z0JBQ1BDLGlCQUFpQixDQUFDLEVBQUU5QixRQUFRQyxHQUFHLENBQUM4QixtQkFBbUIsQ0FBQyxjQUFjLENBQUM7Z0JBQ25FQyxrQkFBa0JmLGFBQWEsaUNBQWlDO1lBQ2xFO1FBQ0Y7UUFFQSxJQUFJVSxnQkFBZ0I7WUFDbEJNLFFBQVEzQixLQUFLLENBQUMscUJBQXFCcUI7WUFDbkMsT0FBT2hDLHFEQUFZQSxDQUFDVSxJQUFJLENBQ3RCO2dCQUFFQyxPQUFPO1lBQTRCLEdBQ3JDO2dCQUFFQyxRQUFRO1lBQUk7UUFFbEI7UUFFQSxPQUFPWixxREFBWUEsQ0FBQ1UsSUFBSSxDQUFDO1lBQ3ZCNkIsU0FBUztZQUNUQyxTQUFTO1FBQ1g7SUFFRixFQUFFLE9BQU83QixPQUFPO1FBQ2QyQixRQUFRM0IsS0FBSyxDQUFDLGdCQUFnQkE7UUFDOUIsT0FBT1gscURBQVlBLENBQUNVLElBQUksQ0FDdEI7WUFBRUMsT0FBTztRQUF3QixHQUNqQztZQUFFQyxRQUFRO1FBQUk7SUFFbEI7QUFDRiIsInNvdXJjZXMiOlsid2VicGFjazovL2NpcmNsZS1uZXR3b3JrLy4vYXBwL2FwaS9hdXRoL2xvZ2luL3JvdXRlLmpzPzhmMGQiXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgTmV4dFJlc3BvbnNlIH0gZnJvbSAnbmV4dC9zZXJ2ZXInO1xyXG5pbXBvcnQgeyBjcmVhdGVDbGllbnQgfSBmcm9tICdAc3VwYWJhc2Uvc3VwYWJhc2UtanMnO1xyXG5cclxuXHJcblxyXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gUE9TVChyZXF1ZXN0KSB7XHJcbiAgLy8gSW5pdGlhbGl6ZSBhdCBydW50aW1lXHJcbiAgY29uc3Qgc3VwYWJhc2VBZG1pbiA9IGNyZWF0ZUNsaWVudChcclxuICAgIHByb2Nlc3MuZW52Lk5FWFRfUFVCTElDX1NVUEFCQVNFX1VSTCxcclxuICAgIHByb2Nlc3MuZW52LlNVUEFCQVNFX1NFUlZJQ0VfUk9MRV9LRVlcclxuICApO1xyXG4gIHRyeSB7XHJcbiAgICBjb25zdCB7IGVtYWlsIH0gPSBhd2FpdCByZXF1ZXN0Lmpzb24oKTtcclxuXHJcbiAgICBpZiAoIWVtYWlsKSB7XHJcbiAgICAgIHJldHVybiBOZXh0UmVzcG9uc2UuanNvbihcclxuICAgICAgICB7IGVycm9yOiAnRW1haWwgaXMgcmVxdWlyZWQnIH0sXHJcbiAgICAgICAgeyBzdGF0dXM6IDQwMCB9XHJcbiAgICAgICk7XHJcbiAgICB9XHJcblxyXG4gICAgY29uc3QgZW1haWxMb3dlciA9IGVtYWlsLnRvTG93ZXJDYXNlKCkudHJpbSgpO1xyXG4gICAgXHJcbiAgICAvLyDinIUgQ2hlY2sgaWYgZW1haWwgYmVsb25ncyB0byBhbiBhZG1pbiB1c2VyXHJcbiAgICBjb25zdCB7IGRhdGE6IGFkbWluUHJvZmlsZSB9ID0gYXdhaXQgc3VwYWJhc2VBZG1pblxyXG4gICAgICAuZnJvbSgncHJvZmlsZXMnKVxyXG4gICAgICAuc2VsZWN0KCdpc19hZG1pbicpXHJcbiAgICAgIC5lcSgnZW1haWwnLCBlbWFpbExvd2VyKVxyXG4gICAgICAuc2luZ2xlKCk7XHJcbiAgICBcclxuICAgIGNvbnN0IGlzQWRtaW5FbWFpbCA9IGFkbWluUHJvZmlsZT8uaXNfYWRtaW4gPT09IHRydWU7XHJcblxyXG4gICAgaWYgKCFpc0FkbWluRW1haWwpIHtcclxuICAgICAgLy8gQ2hlY2sgaWYgdXNlciBleGlzdHMgZm9yIG5vbi1hZG1pbiBlbWFpbHNcclxuICAgICAgY29uc3QgeyBkYXRhOiB7IHVzZXJzIH0sIGVycm9yOiB1c2VyRXJyb3IgfSA9IGF3YWl0IHN1cGFiYXNlQWRtaW4uYXV0aC5hZG1pbi5saXN0VXNlcnMoKTtcclxuICAgICAgXHJcbiAgICAgIGNvbnN0IHVzZXJFeGlzdHMgPSB1c2Vycz8uc29tZSh1c2VyID0+IHVzZXIuZW1haWw/LnRvTG93ZXJDYXNlKCkgPT09IGVtYWlsTG93ZXIpO1xyXG5cclxuICAgICAgaWYgKCF1c2VyRXJyb3IgJiYgIXVzZXJFeGlzdHMpIHtcclxuICAgICAgICByZXR1cm4gTmV4dFJlc3BvbnNlLmpzb24oXHJcbiAgICAgICAgICB7IGVycm9yOiAnTm8gYWNjb3VudCBmb3VuZCB3aXRoIHRoaXMgZW1haWwnIH0sXHJcbiAgICAgICAgICB7IHN0YXR1czogNDA0IH1cclxuICAgICAgICApO1xyXG4gICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgLy8gU2VuZCBtYWdpYyBsaW5rIHVzaW5nIFN1cGFiYXNlIEF1dGhcclxuICAgIGNvbnN0IHsgZXJyb3I6IG1hZ2ljTGlua0Vycm9yIH0gPSBhd2FpdCBzdXBhYmFzZUFkbWluLmF1dGguc2lnbkluV2l0aE90cCh7XHJcbiAgICAgIGVtYWlsOiBlbWFpbExvd2VyLFxyXG4gICAgICBvcHRpb25zOiB7XHJcbiAgICAgICAgZW1haWxSZWRpcmVjdFRvOiBgJHtwcm9jZXNzLmVudi5ORVhUX1BVQkxJQ19BUFBfVVJMfS9hdXRoL2NhbGxiYWNrYCxcclxuICAgICAgICBzaG91bGRDcmVhdGVVc2VyOiBpc0FkbWluRW1haWwgLy8g4pyFIEF1dG8tY3JlYXRlIGZvciBhZG1pbiBlbWFpbHNcclxuICAgICAgfVxyXG4gICAgfSk7XHJcblxyXG4gICAgaWYgKG1hZ2ljTGlua0Vycm9yKSB7XHJcbiAgICAgIGNvbnNvbGUuZXJyb3IoJ01hZ2ljIGxpbmsgZXJyb3I6JywgbWFnaWNMaW5rRXJyb3IpO1xyXG4gICAgICByZXR1cm4gTmV4dFJlc3BvbnNlLmpzb24oXHJcbiAgICAgICAgeyBlcnJvcjogJ0ZhaWxlZCB0byBzZW5kIG1hZ2ljIGxpbmsnIH0sXHJcbiAgICAgICAgeyBzdGF0dXM6IDUwMCB9XHJcbiAgICAgICk7XHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIE5leHRSZXNwb25zZS5qc29uKHtcclxuICAgICAgc3VjY2VzczogdHJ1ZSxcclxuICAgICAgbWVzc2FnZTogJ01hZ2ljIGxpbmsgc2VudCBzdWNjZXNzZnVsbHknXHJcbiAgICB9KTtcclxuXHJcbiAgfSBjYXRjaCAoZXJyb3IpIHtcclxuICAgIGNvbnNvbGUuZXJyb3IoJ0xvZ2luIGVycm9yOicsIGVycm9yKTtcclxuICAgIHJldHVybiBOZXh0UmVzcG9uc2UuanNvbihcclxuICAgICAgeyBlcnJvcjogJ0ludGVybmFsIHNlcnZlciBlcnJvcicgfSxcclxuICAgICAgeyBzdGF0dXM6IDUwMCB9XHJcbiAgICApO1xyXG4gIH1cclxufVxyXG4iXSwibmFtZXMiOlsiTmV4dFJlc3BvbnNlIiwiY3JlYXRlQ2xpZW50IiwiUE9TVCIsInJlcXVlc3QiLCJzdXBhYmFzZUFkbWluIiwicHJvY2VzcyIsImVudiIsIk5FWFRfUFVCTElDX1NVUEFCQVNFX1VSTCIsIlNVUEFCQVNFX1NFUlZJQ0VfUk9MRV9LRVkiLCJlbWFpbCIsImpzb24iLCJlcnJvciIsInN0YXR1cyIsImVtYWlsTG93ZXIiLCJ0b0xvd2VyQ2FzZSIsInRyaW0iLCJkYXRhIiwiYWRtaW5Qcm9maWxlIiwiZnJvbSIsInNlbGVjdCIsImVxIiwic2luZ2xlIiwiaXNBZG1pbkVtYWlsIiwiaXNfYWRtaW4iLCJ1c2VycyIsInVzZXJFcnJvciIsImF1dGgiLCJhZG1pbiIsImxpc3RVc2VycyIsInVzZXJFeGlzdHMiLCJzb21lIiwidXNlciIsIm1hZ2ljTGlua0Vycm9yIiwic2lnbkluV2l0aE90cCIsIm9wdGlvbnMiLCJlbWFpbFJlZGlyZWN0VG8iLCJORVhUX1BVQkxJQ19BUFBfVVJMIiwic2hvdWxkQ3JlYXRlVXNlciIsImNvbnNvbGUiLCJzdWNjZXNzIiwibWVzc2FnZSJdLCJzb3VyY2VSb290IjoiIn0=\n//# sourceURL=webpack-internal:///(rsc)/./app/api/auth/login/route.js\n");

/***/ })

};
;

// load runtime
var __webpack_require__ = require("../../../../webpack-runtime.js");
__webpack_require__.C(exports);
var __webpack_exec__ = (moduleId) => (__webpack_require__(__webpack_require__.s = moduleId))
var __webpack_exports__ = __webpack_require__.X(0, ["vendor-chunks/next","vendor-chunks/@supabase","vendor-chunks/tr46","vendor-chunks/whatwg-url","vendor-chunks/webidl-conversions"], () => (__webpack_exec__("(rsc)/./node_modules/next/dist/build/webpack/loaders/next-app-loader.js?name=app%2Fapi%2Fauth%2Flogin%2Froute&page=%2Fapi%2Fauth%2Flogin%2Froute&appPaths=&pagePath=private-next-app-dir%2Fapi%2Fauth%2Flogin%2Froute.js&appDir=C%3A%5CUsers%5Chamza%5Ccircle-network%5Capp&pageExtensions=tsx&pageExtensions=ts&pageExtensions=jsx&pageExtensions=js&rootDir=C%3A%5CUsers%5Chamza%5Ccircle-network&isDev=true&tsconfigPath=tsconfig.json&basePath=&assetPrefix=&nextConfigOutput=&preferredRegion=&middlewareConfig=e30%3D!")));
module.exports = __webpack_exports__;

})();