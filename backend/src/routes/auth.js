const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const { body, validationResult } = require('express-validator');

const { query } = require('../database/db');
const { authUser } = require('../middleware/auth');
const { notify } = require('../socket');

const router = express.Router();

const signToken = (id) =>
  jwt.sign(
    { id },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );

const signAdminToken = (id) =>
  jwt.sign(
    { id },
    process.env.JWT_ADMIN_SECRET,
    { expiresIn: process.env.JWT_ADMIN_EXPIRES_IN || '12h' }
  );

// ======================================================
// PASSWORD RESET HELPERS
// ======================================================

const getResetSecret = (user) =>
  `${process.env.JWT_SECRET}:${user.password_hash}`;

const getMailTransport = () => {
  const user =
    process.env.GMAIL_USER ||
    process.env.EMAIL_USER;

  const pass =
    process.env.GMAIL_APP_PASSWORD ||
    process.env.EMAIL_PASS;

  if (!user || !pass) {
    throw new Error('Gmail SMTP is not configured');
  }

  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user,
      pass,
    },
  });
};

const sendPasswordResetEmail = async (user, token) => {
  const baseUrl = (
    process.env.FRONTEND_URL ||
    'https://tokzoo.com'
  ).replace(/\/+$/, '');

  const resetUrl =
    `${baseUrl}/?reset_token=${encodeURIComponent(token)}` +
    `&uid=${encodeURIComponent(user.id)}`;

  const from =
    process.env.GMAIL_USER ||
    process.env.EMAIL_USER;

  await getMailTransport().sendMail({
    from: `"TokZoo" <${from}>`,
    to: user.email,
    subject: 'Reset your TokZoo password',

    text:
      `Hi ${user.name || 'TokZoo user'},\n\n` +
      `Use this secure link to reset your password:\n` +
      `${resetUrl}\n\n` +
      `This link expires in 15 minutes.\n\n` +
      `If you did not request this, ignore this email.`,

    html: `
      <div
        style="
          font-family:Arial,sans-serif;
          max-width:560px;
          margin:auto;
          padding:24px;
          color:#111;
        "
      >
        <h2 style="margin:0 0 12px;">
          Reset your TokZoo password
        </h2>

        <p>
          Hi ${user.name || 'TokZoo user'},
        </p>

        <p>
          You requested a password change for your
          TokZoo account.
        </p>

        <p style="margin:24px 0;">
          <a
            href="${resetUrl}"
            style="
              display:inline-block;
              background:#fe2c55;
              color:#fff;
              text-decoration:none;
              padding:12px 20px;
              border-radius:999px;
              font-weight:700;
            "
          >
            Reset Password
          </a>
        </p>

        <p style="font-size:13px;color:#666;">
          This link expires in 15 minutes.
        </p>

        <p style="font-size:13px;color:#666;">
          If you did not request this,
          you can ignore this email.
        </p>
      </div>
    `,
  });
};

// ======================================================
// REGISTER
// ======================================================

router.post(
  '/register',
  [
    body('name').trim().notEmpty(),
    body('email').isEmail().normalizeEmail(),
    body('password').isLength({ min: 6 }),
  ],
  async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array(),
      });
    }

    const {
      name,
      email,
      password,
      phone,
      city,
      role,

      shop_name,
      shopName,

      bio,
      category,

      cnic,
      idNumber,

      legal_name,
      legalName,

      bank_name,
      bankName,

      account_title,
      accountTitle,

      account_number,
      accountNumber,

      shop_address,
      shopAddress,

      country,

      shop_logo,
      shopLogo,

      cnic_front,
      cnicFront,

      cnic_back,
      cnicBack,

      cnic_selfie,
      cnicSelfie,

      invite_code,
      inviteCode,
    } = req.body;

    const finalShopName =
      shop_name ||
      shopName ||
      legal_name ||
      legalName ||
      'My Shop';

    const finalCnic =
      cnic ||
      idNumber ||
      null;

    const finalBank =
      bank_name ||
      bankName ||
      null;

    const finalAccountTitle =
      account_title ||
      accountTitle ||
      null;

    const finalAccountNumber =
      account_number ||
      accountNumber ||
      null;

    const finalLegalName =
      legal_name ||
      legalName ||
      null;

    const finalAddress =
      shop_address ||
      shopAddress ||
      null;

    const finalShopLogo =
      shop_logo ||
      shopLogo ||
      null;

    const finalCnicFront =
      cnic_front ||
      cnicFront ||
      null;

    const finalCnicBack =
      cnic_back ||
      cnicBack ||
      null;

    const finalCnicSelfie =
      cnic_selfie ||
      cnicSelfie ||
      null;

    const finalInviteCode =
      invite_code ||
      inviteCode ||
      null;

    try {
      const existing = await query(
        'SELECT id FROM users WHERE email=$1',
        [email]
      );

      if (existing.rows[0]) {
        return res.status(409).json({
          success: false,
          message: 'Email already registered',
        });
      }

      const hash = await bcrypt.hash(password, 12);

      const { rows } = await query(
        `
          INSERT INTO users (
            name,
            email,
            phone,
            password_hash,
            city,
            status
          )
          VALUES (
            $1,$2,$3,$4,$5,'active'
          )
          RETURNING
            id,
            name,
            email,
            phone,
            city,
            status,
            created_at
        `,
        [
          name,
          email,
          phone || null,
          hash,
          city || null,
        ]
      );

      const user = rows[0];

      let seller = null;

      if (role === 'seller' && finalShopName) {
        const sRes = await query(
          `
            INSERT INTO sellers (
              user_id,
              shop_name,
              shop_bio,
              category,
              cnic,
              bank_name,
              account_title,
              account_number,
              city,
              status,
              legal_name,
              shop_address,
              country,
              shop_logo,
              cnic_front,
              cnic_back,
              cnic_selfie,
              invite_code
            )
            VALUES (
              $1,$2,$3,$4,$5,$6,$7,$8,$9,'pending',
              $10,$11,$12,$13,$14,$15,$16,$17
            )
            RETURNING *
          `,
          [
            user.id,
            finalShopName,
            bio || null,
            category || null,
            finalCnic,
            finalBank,
            finalAccountTitle,
            finalAccountNumber,
            city || null,

            finalLegalName,
            finalAddress,
            country || null,
            finalShopLogo,

            finalCnicFront,
            finalCnicBack,
            finalCnicSelfie,
            finalInviteCode,
          ]
        );

        seller = sRes.rows[0];

        try {
          notify.newSeller({
            ...seller,
            owner_name: name,
            email,
            phone,
          });
        } catch (notifyErr) {
          console.error(
            'Seller notification failed:',
            notifyErr.message
          );
        }
      } else {
        try {
          notify.newBuyer(user);
        } catch (notifyErr) {
          console.error(
            'Buyer notification failed:',
            notifyErr.message
          );
        }
      }

      res.status(201).json({
        success: true,
        token: signToken(user.id),

        user: {
          ...user,
          role:
            seller
              ? 'seller'
              : role || 'buyer',

          seller,
        },
      });
    } catch (err) {
      console.error(
        'Registration error:',
        err
      );

      res.status(500).json({
        success: false,
        message:
          err.message ||
          'Registration failed',
      });
    }
  }
);

// ======================================================
// LOGIN
// ======================================================

router.post('/login', async (req, res) => {
  const {
    email,
    password,
  } = req.body;

  try {
    const { rows } = await query(
      'SELECT * FROM users WHERE email=$1',
      [email?.toLowerCase()]
    );

    const user = rows[0];

    if (
      !user ||
      !(await bcrypt.compare(
        password,
        user.password_hash
      ))
    ) {
      return res.status(401).json({
        success: false,
        message:
          'Invalid email or password',
      });
    }

    if (user.status === 'suspended') {
      return res.status(403).json({
        success: false,
        message:
          'Account suspended. Contact support.',
      });
    }

    // IMPORTANT:
    // Full seller record return karna hai
    // taake profile form signup data show kare.
    const sellerRow = await query(
      `
        SELECT *
        FROM sellers
        WHERE user_id=$1
      `,
      [user.id]
    );

    const seller =
      sellerRow.rows[0] ||
      null;

    await query(
      `
        UPDATE users
        SET updated_at=NOW()
        WHERE id=$1
      `,
      [user.id]
    );

    res.json({
      success: true,

      token:
        signToken(user.id),

      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        city: user.city,

        profileImg:
          user.profile_img,

        status:
          user.status,

        role:
          seller
            ? 'seller'
            : 'buyer',

        seller,
      },
    });
  } catch (err) {
    console.error(
      'Login error:',
      err
    );

    res.status(500).json({
      success: false,
      message:
        'Login failed',
    });
  }
});

// ======================================================
// ADMIN LOGIN
// ======================================================

router.post(
  '/admin/login',
  async (req, res) => {
    const {
      email,
      password,
    } = req.body;

    try {
      const { rows } = await query(
        `
          SELECT *
          FROM admins
          WHERE email=$1
          AND is_active=true
        `,
        [
          email?.toLowerCase(),
        ]
      );

      const admin =
        rows[0];

      if (
        !admin ||
        !(await bcrypt.compare(
          password,
          admin.password_hash
        ))
      ) {
        return res.status(401).json({
          success: false,
          message:
            'Invalid admin credentials',
        });
      }

      await query(
        `
          UPDATE admins
          SET last_login=NOW()
          WHERE id=$1
        `,
        [admin.id]
      );

      res.json({
        success: true,

        token:
          signAdminToken(
            admin.id
          ),

        admin: {
          id:
            admin.id,

          name:
            admin.name,

          email:
            admin.email,

          role:
            admin.role,
        },
      });
    } catch (err) {
      console.error(
        'Admin login error:',
        err
      );

      res.status(500).json({
        success: false,
        message:
          'Admin login failed',
      });
    }
  }
);

// ======================================================
// CURRENT USER / FULL PROFILE
// ======================================================

router.get(
  '/me',
  authUser,
  async (req, res) => {
    try {
      const { rows } =
        await query(
          `
            SELECT
              id,
              name,
              email,
              phone,
              city,
              profile_img,
              status,
              created_at
            FROM users
            WHERE id=$1
          `,
          [req.user.id]
        );

      const account =
        rows[0];

      if (!account) {
        return res.status(404).json({
          success: false,
          message:
            'User not found',
        });
      }

      // Full seller information.
      const sellerResult =
        await query(
          `
            SELECT *
            FROM sellers
            WHERE user_id=$1
          `,
          [req.user.id]
        );

      const seller =
        sellerResult.rows[0] ||
        null;

      res.json({
        success: true,

        user: {
          ...account,

          profileImg:
            account.profile_img ||
            null,

          role:
            seller
              ? 'seller'
              : 'buyer',

          seller,
        },
      });
    } catch (err) {
      console.error(
        'Load profile failed:',
        err
      );

      res.status(500).json({
        success: false,
        message:
          'Failed to load profile',
      });
    }
  }
);

// ======================================================
// UPDATE PROFILE
// ======================================================

router.put(
  '/profile',
  authUser,
  async (req, res) => {
    const {
      name,
      phone,
      city,
      profileImg,
      shopName,
      bio,
    } = req.body;

    try {
      const { rows } =
        await query(
          `
            UPDATE users
            SET
              name=$1,
              phone=$2,
              city=$3,
              profile_img=
                COALESCE(
                  $4,
                  profile_img
                ),
              updated_at=NOW()
            WHERE id=$5
            RETURNING
              id,
              name,
              email,
              phone,
              city,
              profile_img,
              status,
              created_at
          `,
          [
            name || null,
            phone || null,
            city || null,
            profileImg || null,
            req.user.id,
          ]
        );

      const account =
        rows[0];

      const sellerCheck =
        await query(
          `
            SELECT id
            FROM sellers
            WHERE user_id=$1
          `,
          [req.user.id]
        );

      let seller = null;

      if (
        sellerCheck.rows[0]
      ) {
        const sellerResult =
          await query(
            `
              UPDATE sellers
              SET
                shop_name=
                  COALESCE(
                    $1,
                    shop_name
                  ),

                shop_bio=$2,

                city=
                  COALESCE(
                    $3,
                    city
                  ),

                updated_at=NOW()

              WHERE user_id=$4

              RETURNING *
            `,
            [
              shopName || null,
              bio ?? null,
              city || null,
              req.user.id,
            ]
          );

        seller =
          sellerResult.rows[0] ||
          null;
      }

      res.json({
        success: true,

        user: {
          ...account,

          profileImg:
            account?.profile_img ||
            null,

          role:
            seller
              ? 'seller'
              : 'buyer',

          seller,
        },

        seller,
      });
    } catch (err) {
      console.error(
        'Profile update failed:',
        err
      );

      res.status(500).json({
        success: false,
        message:
          'Update failed',
      });
    }
  }
);

// ======================================================
// SEND PASSWORD RESET LINK
// ======================================================

router.post(
  '/request-password-reset',
  authUser,
  async (req, res) => {
    try {
      const { rows } =
        await query(
          `
            SELECT
              id,
              name,
              email,
              password_hash
            FROM users
            WHERE id=$1
          `,
          [req.user.id]
        );

      const user =
        rows[0];

      if (
        !user ||
        !user.email
      ) {
        return res
          .status(404)
          .json({
            success: false,
            message:
              'Registered email not found',
          });
      }

      // Password hash ko secret me include kiya gaya hai.
      // Password change hote hi old reset tokens
      // automatically invalid ho jayenge.
      const token =
        jwt.sign(
          {
            id:
              user.id,

            purpose:
              'password-reset',
          },

          getResetSecret(
            user
          ),

          {
            expiresIn:
              '15m',
          }
        );

      await sendPasswordResetEmail(
        user,
        token
      );

      res.json({
        success: true,

        message:
          `Password reset link sent to ${user.email}`,
      });
    } catch (err) {
      console.error(
        'Password reset email failed:',
        err
      );

      res.status(500).json({
        success: false,

        message:
          err.message ===
          'Gmail SMTP is not configured'
            ? 'Email service is not configured'
            : 'Could not send password reset email',
      });
    }
  }
);

// ======================================================
// RESET PASSWORD
// ======================================================

router.post(
  '/reset-password',

  [
    body('uid')
      .notEmpty(),

    body('token')
      .notEmpty(),

    body('password')
      .isLength({
        min: 6,
      }),
  ],

  async (req, res) => {
    const errors =
      validationResult(req);

    if (
      !errors.isEmpty()
    ) {
      return res
        .status(400)
        .json({
          success: false,

          message:
            'Password must be at least 6 characters',
        });
    }

    const {
      uid,
      token,
      password,
    } = req.body;

    try {
      const { rows } =
        await query(
          `
            SELECT
              id,
              password_hash
            FROM users
            WHERE id=$1
          `,
          [uid]
        );

      const user =
        rows[0];

      if (!user) {
        return res
          .status(400)
          .json({
            success: false,

            message:
              'Invalid or expired reset link',
          });
      }

      let payload;

      try {
        payload =
          jwt.verify(
            token,
            getResetSecret(
              user
            )
          );
      } catch {
        return res
          .status(400)
          .json({
            success: false,

            message:
              'Invalid or expired reset link',
          });
      }

      if (
        String(
          payload.id
        ) !==
          String(
            user.id
          ) ||

        payload.purpose !==
          'password-reset'
      ) {
        return res
          .status(400)
          .json({
            success: false,

            message:
              'Invalid or expired reset link',
          });
      }

      const hash =
        await bcrypt.hash(
          password,
          12
        );

      await query(
        `
          UPDATE users
          SET
            password_hash=$1,
            updated_at=NOW()
          WHERE id=$2
        `,
        [
          hash,
          user.id,
        ]
      );

      res.json({
        success: true,

        message:
          'Password changed successfully',
      });
    } catch (err) {
      console.error(
        'Password reset failed:',
        err
      );

      res.status(500).json({
        success: false,

        message:
          'Password reset failed',
      });
    }
  }
);

// ======================================================
// SELLER ONBOARD
// ======================================================

router.post(
  '/seller-onboard',
  authUser,
  async (req, res) => {
    const {
      shop_name,
      shopName,

      bio,
      category,

      cnic,
      idNumber,

      legal_name,
      legalName,

      bank_name,
      bankName,

      account_title,
      accountTitle,

      account_number,
      accountNumber,

      city,
      phone,

      shop_address,
      shopAddress,

      country,

      shop_logo,
      shopLogo,

      cnic_front,
      cnicFront,

      cnic_back,
      cnicBack,

      cnic_selfie,
      cnicSelfie,

      invite_code,
      inviteCode,
    } = req.body;

    const finalShopName =
      shop_name ||
      shopName ||
      legal_name ||
      legalName ||
      'My Shop';

    const finalBank =
      bank_name ||
      bankName;

    const finalAccountTitle =
      account_title ||
      accountTitle;

    const finalAccountNumber =
      account_number ||
      accountNumber;

    const finalCnic =
      cnic ||
      idNumber;

    const finalLegalName =
      legal_name ||
      legalName;

    const finalAddress =
      shop_address ||
      shopAddress;

    const finalShopLogo =
      shop_logo ||
      shopLogo;

    const finalCnicFront =
      cnic_front ||
      cnicFront;

    const finalCnicBack =
      cnic_back ||
      cnicBack;

    const finalCnicSelfie =
      cnic_selfie ||
      cnicSelfie;

    const finalInviteCode =
      invite_code ||
      inviteCode;

    try {
      await query(
        `
          UPDATE users
          SET
            phone=
              COALESCE(
                $1,
                phone
              ),

            city=
              COALESCE(
                $2,
                city
              ),

            updated_at=NOW()

          WHERE id=$3
        `,
        [
          phone || null,
          city || null,
          req.user.id,
        ]
      );

      const existing =
        await query(
          `
            SELECT id
            FROM sellers
            WHERE user_id=$1
          `,
          [req.user.id]
        );

      let seller;

      if (
        existing.rows[0]
      ) {
        const { rows } =
          await query(
            `
              UPDATE sellers
              SET
                shop_name=$1,
                shop_bio=$2,
                category=$3,
                cnic=$4,
                bank_name=$5,
                account_title=$6,
                account_number=$7,
                city=$8,
                legal_name=$9,
                shop_address=$10,
                country=$11,

                shop_logo=
                  COALESCE(
                    $12,
                    shop_logo
                  ),

                cnic_front=
                  COALESCE(
                    $13,
                    cnic_front
                  ),

                cnic_back=
                  COALESCE(
                    $14,
                    cnic_back
                  ),

                cnic_selfie=
                  COALESCE(
                    $15,
                    cnic_selfie
                  ),

                invite_code=$16,
                updated_at=NOW()

              WHERE user_id=$17

              RETURNING *
            `,
            [
              finalShopName,
              bio || null,
              category || null,
              finalCnic || null,
              finalBank || null,
              finalAccountTitle || null,
              finalAccountNumber || null,
              city || null,
              finalLegalName || null,
              finalAddress || null,
              country || null,
              finalShopLogo || null,
              finalCnicFront || null,
              finalCnicBack || null,
              finalCnicSelfie || null,
              finalInviteCode || null,
              req.user.id,
            ]
          );

        seller =
          rows[0];
      } else {
        const { rows } =
          await query(
            `
              INSERT INTO sellers (
                user_id,
                shop_name,
                shop_bio,
                category,
                cnic,

                bank_name,
                account_title,
                account_number,

                city,
                status,

                legal_name,
                shop_address,
                country,
                shop_logo,

                cnic_front,
                cnic_back,
                cnic_selfie,

                invite_code
              )

              VALUES (
                $1,$2,$3,$4,$5,
                $6,$7,$8,$9,
                'pending',
                $10,$11,$12,$13,
                $14,$15,$16,$17
              )

              RETURNING *
            `,
            [
              req.user.id,
              finalShopName,
              bio || null,
              category || null,
              finalCnic || null,

              finalBank || null,
              finalAccountTitle || null,
              finalAccountNumber || null,

              city || null,

              finalLegalName || null,
              finalAddress || null,
              country || null,
              finalShopLogo || null,

              finalCnicFront || null,
              finalCnicBack || null,
              finalCnicSelfie || null,

              finalInviteCode || null,
            ]
          );

        seller =
          rows[0];
      }

      try {
        notify.newSeller({
          ...seller,

          owner_name:
            req.user.name,

          email:
            req.user.email,

          phone:
            phone || null,
        });
      } catch (notifyErr) {
        console.error(
          'Seller notification failed:',
          notifyErr.message
        );
      }

      res.json({
        success: true,

        message:
          'Seller onboarding complete',

        seller,
      });
    } catch (err) {
      console.error(
        'Seller onboard error:',
        err
      );

      res.status(500).json({
        success: false,

        message:
          err.message ||
          'Onboarding failed',
      });
    }
  }
);

module.exports = router;