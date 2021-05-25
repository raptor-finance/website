<?php
/**
 * The base configuration for WordPress
 *
 * The wp-config.php creation script uses this file during the
 * installation. You don't have to use the web site, you can
 * copy this file to "wp-config.php" and fill in the values.
 *
 * This file contains the following configurations:
 *
 * * MySQL settings
 * * Secret keys
 * * Database table prefix
 * * ABSPATH
 *
 * @link https://wordpress.org/support/article/editing-wp-config-php/
 *
 * @package WordPress
 */

// ** MySQL settings - You can get this info from your web host ** //
/** The name of the database for WordPress */
define( 'DB_NAME', 'tombrela_raptor' );

/** MySQL database username */
define( 'DB_USER', 'tombrela_uraptor' );

/** MySQL database password */
define( 'DB_PASSWORD', 'FN_)VdRGrVK@' );

/** MySQL hostname */
define( 'DB_HOST', 'localhost' );

/** Database Charset to use in creating database tables. */
define( 'DB_CHARSET', 'utf8mb4' );

/** The Database Collate type. Don't change this if in doubt. */
define( 'DB_COLLATE', '' );

/**#@+
 * Authentication Unique Keys and Salts.
 *
 * Change these to different unique phrases!
 * You can generate these using the {@link https://api.wordpress.org/secret-key/1.1/salt/ WordPress.org secret-key service}
 * You can change these at any point in time to invalidate all existing cookies. This will force all users to have to log in again.
 *
 * @since 2.6.0
 */
define( 'AUTH_KEY',         'RkR+<8/uq+RjGzkW{T q_mbSRln7M%*ndLKhyi4oK3[M(az-L65u/aI[ZY:!JMbo' );
define( 'SECURE_AUTH_KEY',  'r4wC7s_RCd3K(b(w:B,Ry=W3O.&VhiPQ}AQd(ixo|e8,?V#9xN?*6kC4L*V#xJu,' );
define( 'LOGGED_IN_KEY',    'ZonO?a h8ko>E<bw4hggdO]m5Hk-UugEmJ#+Rt=Lm9FL002x[z]XVY~DlM<<*|v|' );
define( 'NONCE_KEY',        '$QMLm/)nS#:hzq~cpPgWxy~I,W{[  )Jst+IuqDd42)/Q`.o;y$p([6[#@0p+;Dz' );
define( 'AUTH_SALT',        '?e`T*pk/1H)X?bE5){}7)Z |4*]TzS-X9~M8y9@Y+u=LyX?tGP$-+@<j2r#oKw,|' );
define( 'SECURE_AUTH_SALT', 'j L =^2FnJdV!v*XSd{*RgJr*;VQ^tQD>QJrCuAcQTN02y4fN>=<>A<GF1hX$+Dl' );
define( 'LOGGED_IN_SALT',   '@q2%5Zl.@X/f4d^NU={f!|uBzx6^euFd/q^:E&6ey,FyJUU+C3^[v)mTH2)kNb^q' );
define( 'NONCE_SALT',       'BO-{R(rTzSh[p59XG_lyoSSdhnu4MbQHD#XjbKXO8C<-:lN.7=(iMy#A|]pQXql^' );

/**#@-*/

/**
 * WordPress Database Table prefix.
 *
 * You can have multiple installations in one database if you give each
 * a unique prefix. Only numbers, letters, and underscores please!
 */
$table_prefix = 'wp_';

/**
 * For developers: WordPress debugging mode.
 *
 * Change this to true to enable the display of notices during development.
 * It is strongly recommended that plugin and theme developers use WP_DEBUG
 * in their development environments.
 *
 * For information on other constants that can be used for debugging,
 * visit the documentation.
 *
 * @link https://wordpress.org/support/article/debugging-in-wordpress/
 */
define( 'WP_DEBUG', false );

/* That's all, stop editing! Happy publishing. */

/** Absolute path to the WordPress directory. */
if ( ! defined( 'ABSPATH' ) ) {
	define( 'ABSPATH', __DIR__ . '/' );
}

/** Sets up WordPress vars and included files. */
require_once ABSPATH . 'wp-settings.php';
