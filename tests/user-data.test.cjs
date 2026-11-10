const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { test } = require('node:test');
const ts = require('typescript');
const bcrypt = require('bcryptjs');

// Load the project's pure TypeScript helpers without adding a test framework.
function loadSource(relativePath, environment = process.env) {
  const filename = path.resolve(__dirname, '..', relativePath);
  const code = ts.transpileModule(fs.readFileSync(filename, 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  }).outputText;
  const module = { exports: {} };
  const localRequire = (name) => name.startsWith('@/')
    ? loadSource(`src/${name.slice(2)}.ts`, environment) : require(name);
  vm.runInThisContext(`(function(require, module, exports, process) { ${code}\n})`, { filename })(
    localRequire, module, module.exports, { env: environment },
  );
  return module.exports;
}

const { validateUserInput, assertUserInput } = loadSource('src/utils/user-validation.ts');
const { buildUserPayload } = loadSource('src/utils/user-payload.ts');
const input = { email: ' Test@Example.com ', password: 'Valid Password 123', hoten: ' Test User ', hinhanh: 'https://example.com/avatar.jpg' };

test('detail route preserves exact Firestore IDs containing percent escapes on navigation and reload', () => {
  const { resolveHref } = require('../node_modules/expo-router/build/link/href');
  const { getStateFromPath } = require('../node_modules/expo-router/build/fork/getStateFromPath');
  const React = require('react');
  const { renderToStaticMarkup } = require('react-dom/server');
  const { useRoute } = require('../node_modules/expo-router/build/react-navigation/core/useRoute');
  const { NavigationRouteContext } = require('../node_modules/expo-router/build/react-navigation/core/NavigationProvider');
  const { getRouteParam } = loadSource('src/utils/route-params.ts');
  const config = { screens: { users: { path: 'users', screens: { '[id]': ':id' } } } };
  const ids = [encodeURIComponent('test@example.com'), encodeURIComponent('test+one@example.com'),
    'literal%2540id', 'raw@example.com', 'AutoDocument123', 'encoded%2Fid', 'người dùng'];
  for (const id of ids) {
    const href = resolveHref({ pathname: '/users/[id]', params: { id } });
    for (const url of [href, new URL(href, 'https://example.test').pathname]) {
      let state = getStateFromPath(url, config);
      let route;
      while (state) { route = state.routes[state.index ?? 0]; state = route.state; }
      assert.equal(getRouteParam(route.params.id), id);
      let observedId;
      function DetailRouteProbe() {
        observedId = getRouteParam(useRoute().params.id);
        return null;
      }
      renderToStaticMarkup(React.createElement(NavigationRouteContext.Provider, { value: route }, React.createElement(DetailRouteProbe)));
      assert.equal(observedId, id, 'the actual route hook must keep the original document ID');
    }
  }
  const storedId = encodeURIComponent('test@example.com');
  assert.notEqual(decodeURIComponent(storedId), storedId, 'decoding opaque document IDs a second time changes the document');
});

test('admin access fails closed when UID is missing or does not match', () => {
  const missing = loadSource('src/config/admin.ts', {});
  assert.equal(missing.isAdminUid('any-user'), false);
  assert.throws(missing.assertAdminConfig, /EXPO_PUBLIC_ADMIN_UID/);
  const configured = loadSource('src/config/admin.ts', { EXPO_PUBLIC_ADMIN_UID: 'configured-admin' });
  assert.equal(configured.isAdminUid(undefined), false);
  assert.equal(configured.isAdminUid('another-account'), false);
  assert.equal(configured.isAdminUid('configured-admin'), true);
});

test('client search supports name, email, Vietnamese accents and empty queries', () => {
  const { filterUsers } = loadSource('src/utils/search-users.ts');
  const users = [
    { id: 'a', data: { hoten: 'Đặng Ánh', email: 'anh@example.com', hinhanh: '' } },
    { id: 'b', data: { hoten: 'Bình', email: 'binh@example.com', hinhanh: '' } },
  ];
  assert.equal(filterUsers(users, 'DANG ANH')[0]?.id, 'a');
  assert.equal(filterUsers(users, 'BINH@')[0]?.id, 'b');
  assert.equal(filterUsers(users, 'no-match').length, 0);
  assert.equal(filterUsers(users, '   '), users);
  assert.equal(users.length, 2);
});

test('authentication failures have Vietnamese messages without raw SDK details', () => {
  const { getErrorMessage } = loadSource('src/utils/service-error.ts');
  assert.equal(getErrorMessage({ code: 'auth/invalid-credential' }), 'Email hoặc mật khẩu không đúng.');
  assert.match(getErrorMessage({ code: 'auth/network-request-failed' }), /Kiểm tra mạng/);
  assert.match(getErrorMessage({ code: 'auth/operation-not-allowed' }), /Email\/Password/);
});

test('normalizes identity/profile but preserves exact password', () => {
  const value = assertUserInput(input);
  assert.equal(value.email, 'test@example.com');
  assert.equal(value.hoten, 'Test User');
  assert.equal(value.password, input.password);
});

test('requires fields, valid email, HTTPS image URL and safe bcrypt byte length', () => {
  assert.equal(Object.keys(validateUserInput({ email: '', password: '', hoten: '', hinhanh: '' })).length, 4);
  assert.ok(validateUserInput({ ...input, email: 'invalid' }).email);
  assert.ok(validateUserInput({ ...input, hinhanh: 'javascript:alert(1)' }).hinhanh);
  assert.ok(validateUserInput({ ...input, hinhanh: 'http://example.com/avatar.jpg' }).hinhanh);
  assert.equal(validateUserInput({ ...input, hinhanh: '' }, false, true).hinhanh, undefined);
  assert.ok(validateUserInput({ ...input, hinhanh: '' }).hinhanh);
  assert.ok(validateUserInput({ ...input, password: 'short' }).password);
  assert.ok(validateUserInput({ ...input, password: '密'.repeat(25) }).password);
  assert.equal(validateUserInput({ ...input, password: '' }, true).password, undefined);
  assert.ok(validateUserInput({ ...input, password: '   ' }, true).password);
});

test('stored payload has exactly four fields and only a salted hash as matkhau', async () => {
  const value = assertUserInput(input);
  const passwordHash = await bcrypt.hash(value.password, 12);
  assert.equal(await bcrypt.compare(value.password, passwordHash), true);
  const payload = buildUserPayload({ ...value, id: 'extra', role: 'admin', createdAt: 'extra' }, passwordHash);
  assert.deepEqual(Object.keys(payload).sort(), ['email', 'hinhanh', 'hoten', 'matkhau']);
  assert.equal(payload.matkhau, passwordHash);
  assert.notEqual(payload.matkhau, value.password);
  assert.equal(bcrypt.getRounds(payload.matkhau), 12);
  assert.throws(() => buildUserPayload(value, value.password));
  assert.throws(() => buildUserPayload(value, undefined));
  assert.throws(() => buildUserPayload({ ...value, hinhanh: 'file:///image.jpg' }, passwordHash));
  assert.throws(() => buildUserPayload({ ...value, hinhanh: 'http://example.com/image.jpg' }, passwordHash));
  assert.equal(buildUserPayload({ ...value, password: '' }, passwordHash).matkhau, passwordHash);
});

test('selected images are checked by content and actual byte size, not filename', () => {
  const { validateSelectedImage } = loadSource('src/utils/image-validation.ts');
  const base64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+a3ioAAAAASUVORK5CYII=';
  const image = { uri: 'file:///photo.png', base64, width: 1, height: 1, type: 'image' };
  const result = validateSelectedImage(image);
  assert.equal(result.mimeType, 'image/png');
  assert.equal(result.size, Buffer.from(base64, 'base64').length);
  assert.throws(() => validateSelectedImage({ ...image, base64: Buffer.from('not an image').toString('base64') }));
  assert.throws(() => validateSelectedImage({ ...image, type: 'video' }));
  assert.throws(() => validateSelectedImage({ ...image, width: 0 }));
  assert.throws(() => validateSelectedImage({ ...image, fileSize: 6 * 1024 * 1024 }));
  assert.throws(() => validateSelectedImage({ ...image, base64: 'A'.repeat(7 * 1024 * 1024) }));
  assert.throws(() => validateSelectedImage({ ...image, base64: '%%%=' }));
});

test('Cloudinary response must be a complete image response with HTTPS URL', () => {
  const { getCloudinaryImageUrl } = loadSource('src/utils/image-validation.ts');
  const data = { secure_url: 'https://res.cloudinary.com/test/image/upload/photo.png', resource_type: 'image', bytes: 500, width: 20, height: 20 };
  assert.equal(getCloudinaryImageUrl(data), data.secure_url);
  assert.throws(() => getCloudinaryImageUrl({ ...data, secure_url: 'http://example.com/image.png' }));
  assert.throws(() => getCloudinaryImageUrl({ ...data, resource_type: 'raw' }));
  assert.throws(() => getCloudinaryImageUrl({ ...data, bytes: 6 * 1024 * 1024 }));
  assert.throws(() => getCloudinaryImageUrl({ ...data, width: Infinity }));
  assert.throws(() => getCloudinaryImageUrl({ secure_url: data.secure_url }));
});

test('missing Cloudinary configuration identifies the exact public variables', () => {
  const { assertCloudinaryConfig } = loadSource('src/config/cloudinary.ts', {});
  assert.throws(assertCloudinaryConfig, (error) => {
    assert.ok(error.message.includes('EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME'));
    assert.ok(error.message.includes('EXPO_PUBLIC_CLOUDINARY_UPLOAD_PRESET'));
    return true;
  });
});

test('missing config names are reported and values are never included', () => {
  const { assertFirebaseConfig } = loadSource('src/config/env.ts', {});
  assert.throws(assertFirebaseConfig, (error) => {
    for (const key of ['API_KEY', 'AUTH_DOMAIN', 'PROJECT_ID', 'STORAGE_BUCKET', 'MESSAGING_SENDER_ID', 'APP_ID']) {
      assert.ok(error.message.includes('EXPO_PUBLIC_FIREBASE_' + key));
    }
    return true;
  });
});
