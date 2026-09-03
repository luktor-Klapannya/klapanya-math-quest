# Direct Game Admin URL

Local implementation: `/` → public Landing; `/admin` and `/admin/` → session restoration → existing Admin render guard. Denied real sessions see locked Admin Login. Mock mode remains denied. Logo entry uses the same `/admin` path. Logout replaces the URL with `/` and removes privileged content immediately. Browser back/forward resolves the entry path again. No React Router dependency, SSO or School Management changes.

The URL is navigation, not authorization. The existing guard verifies the Supabase server identity, ACTIVE linked profile and organization ADMIN membership. No Admin data renders while restoration/validation is pending. RLS and API authorization remain unchanged.

## Hosting inventory and precondition

Repository configuration inspected: `public/.htaccess`, Vite public assets and screen-state routing. Live Plesk document root, Apache modules, AllowOverride, proxy mode and deployed files have NOT been inspected. No deployment performed. Hosted `/admin` remains unverified.

Build with `npm run build`. Deploy the *contents* of `dist` to the configured domain document root during an authorized deployment. Include the hidden `.htaccess`; do not assume an FTP upload included dotfiles. HTML and asset paths assume hosting at the domain root.

### Apache / Plesk Apache proxy mode

The existing `public/.htaccess` already supplies:

```apache
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /
  RewriteRule ^index\.html$ - [L]
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteRule . /index.html [L]
</IfModule>
```

Require Apache `mod_rewrite`, permission for these rewrite directives through `AllowOverride`, and requests for `/admin` reaching Apache. Existing real files/directories remain served normally. Preserve separately configured `/game-api/` and `/backend-api/` reverse proxies; API requests must reach their servers, not SPA HTML. Do not replace unrelated Plesk configuration.

### Nginx-only serving (alternative)

Apache `.htaccess` has no effect when Nginx handles the request without Apache. An operator may add these narrowly scoped locations to the domain's reviewed Nginx configuration, using its existing document root:

```nginx
location = /admin {
    try_files /index.html =404;
}
location = /admin/ {
    try_files /index.html =404;
}
```

Do not add a conflicting second `location /`, overwrite generated Plesk blocks or change API/static asset routing. Confirm the active document root actually contains this SPA's `index.html`; configuration testing/reload is an operator action, not performed here.

## Hosted operator checks

1. Confirm authorized deployment target and active document root; preserve the existing release for rollback.
2. Open `/` in a fresh browser: public Landing, Learner/Teacher entry, Guest guide and Library notice remain available.
3. Open `/admin` without a session and refresh: SPA loads; real mode shows Admin Login, never Teacher Home.
4. Use a real ACTIVE Game ADMIN: login and direct reload show Backend only after validation.
5. Use real PROFESSOR, LEARNER, external roles and disabled profile: no Backend data. Mock identity must never authorize Admin.
6. Logout: URL `/`, no privileged content; browser back to `/admin` must require authorization again.
7. Confirm JS/CSS/images return assets (not HTML), and both API proxies still return their expected responses.
8. Confirm root and `/admin` work in another browser/device. Record actual hosted results before linking from the management portal.

Local unit/fake-client guard tests are not hosted account or multi-device evidence. The stable link can be prepared as `https://learn.klapanya.ac.th/admin`; do not claim the deployed link works until the hosting checks pass.

## Local verification performed

- Admin/path suite: 44 checks; authentication: 42; acceptance: 245; frozen engine: 14. The 710Q timer audit completed.
- Local Vite browser: direct `/admin` denied mock authorization; Return to landing changed pathname to `/` and displayed public entries; logo changed pathname to `/admin`; reload remained denied.
- Real ADMIN/PROFESSOR/LEARNER/external/inactive authorization and logout invalidation were exercised with isolated test clients, not hosted accounts. Real-auth browser login and live Plesk refresh remain unverified.
- `dist/.htaccess` exists after the build. No hosting changes were applied.

Status: `ADMIN_URL_READY_WITH_HOSTING_PRECONDITION`.
