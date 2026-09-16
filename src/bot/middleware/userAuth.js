const User = require('../../models/User');

const userAuthMiddleware = async (ctx, next) => {
  if (!ctx.from) return next();

  const telegramId = ctx.from.id;
  const firstName = ctx.from.first_name || '';
  const lastName = ctx.from.last_name || '';
  const username = ctx.from.username || '';

  try {
    const isLoginEvent = ctx.message?.text?.trim().startsWith('/start');
    const isLogoutEvent = ['/stop', '/logout'].includes(ctx.message?.text?.trim());
    let user = await User.findOne({ telegramId });

    if (!user) {
      user = await User.create({
        telegramId,
        firstName,
        lastName,
        username,
        role: 'user',
        lastActive: new Date(),
        lastLoginAt: isLoginEvent ? new Date() : null,
        lastLogoutAt: null
      });
    } else {
      user.firstName = firstName;
      user.lastName = lastName;
      user.username = username;
      user.lastActive = new Date();
      if (isLoginEvent) user.lastLoginAt = new Date();
      if (isLogoutEvent) user.lastLogoutAt = new Date();
      await user.save();
    }

    if (user.isBlocked) {
      return ctx.reply(
        '🚫 Sizning hisobingiz administrator tomonidan bloklangan.\nQo‘shimcha ma’lumot uchun adminga murojaat qiling.'
      );
    }

    ctx.dbUser = user;
    return next();
  } catch (err) {
    console.error('[Bot UserAuth Error]:', err.message);
    return next();
  }
};

module.exports = userAuthMiddleware;
