using AngularProject.Data;
using AngularProject.Models;
using FluentValidation;
using FluentValidation.Results;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace AngularProject.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class ShoppingCartController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly IValidator<ShoppingCart> _validator;

        public ShoppingCartController(ApplicationDbContext context, IValidator<ShoppingCart> validator)
        {
            _context = context;
            _validator = validator;
        }

        [HttpGet]
        public async Task<ActionResult<List<ShoppingCart>>> GetShoppingCarts()
        {
            try
            {
                var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
                if (string.IsNullOrEmpty(userId))
                {
                    return Unauthorized();
                }

                return Ok(await _context.ShoppingCart
                    .Where(cart => cart.UserId == userId)
                    .ToListAsync());
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpPost]
        public async Task<IActionResult> CreateShoppingCart([FromBody] ShoppingCart shoppingCart)
        {
            try
            {
                ValidationResult validationResult = await _validator.ValidateAsync(shoppingCart);
                if (!validationResult.IsValid)
                {
                    foreach (var error in validationResult.Errors)
                    {
                        ModelState.AddModelError(error.PropertyName, error.ErrorMessage);
                    }

                    return ValidationProblem(ModelState);
                }

                var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
                if (string.IsNullOrEmpty(userId))
                {
                    return Unauthorized();
                }

                var existingCart = await _context.ShoppingCart
                    .FirstOrDefaultAsync(cart => cart.UserId == userId);

                if (existingCart is not null)
                {
                    return Ok(existingCart);
                }

                shoppingCart.UserId = userId;

                await _context.ShoppingCart.AddAsync(shoppingCart);
                await _context.SaveChangesAsync();

                return Ok(shoppingCart);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteShoppingCart(int id)
        {
            try
            {
                var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
                if (string.IsNullOrEmpty(userId))
                {
                    return Unauthorized();
                }

                var shoppingCart = await _context.ShoppingCart
                    .FirstOrDefaultAsync(cart => cart.CartID == id && cart.UserId == userId);

                if (shoppingCart == null)
                {
                    return NotFound();
                }

                var cartItems = await _context.CartItem
                    .Where(item => item.CartID == shoppingCart.CartID)
                    .ToListAsync();

                _context.CartItem.RemoveRange(cartItems);
                _context.ShoppingCart.Remove(shoppingCart);
                await _context.SaveChangesAsync();

                return Ok(shoppingCart);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }
    }
}
