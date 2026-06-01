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
    public class CartItemsController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly IValidator<CartItem> _validator;

        public CartItemsController(ApplicationDbContext context, IValidator<CartItem> validator)
        {
            _context = context;
            _validator = validator;
        }

        [HttpGet]
        public async Task<ActionResult<List<CartItem>>> GetCartItems()
        {
            try
            {
                var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
                if (string.IsNullOrEmpty(userId))
                {
                    return Unauthorized();
                }

                return Ok(await _context.CartItem
                    .Join(
                        _context.ShoppingCart,
                        cartItem => cartItem.CartID,
                        shoppingCart => shoppingCart.CartID,
                        (cartItem, shoppingCart) => new { cartItem, shoppingCart })
                    .Where(result => result.shoppingCart.UserId == userId)
                    .Select(result => result.cartItem)
                    .ToListAsync());
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetCartItemById(int id)
        {
            try
            {
                var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
                if (string.IsNullOrEmpty(userId))
                {
                    return Unauthorized();
                }

                var cartItem = await _context.CartItem
                    .Join(
                        _context.ShoppingCart,
                        item => item.CartID,
                        cart => cart.CartID,
                        (item, cart) => new { item, cart })
                    .Where(result => result.item.CartItemID == id && result.cart.UserId == userId)
                    .Select(result => result.item)
                    .FirstOrDefaultAsync();

                if (cartItem == null)
                {
                    return NotFound();
                }

                return Ok(cartItem);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateCartItem(int id, [FromBody] CartItem cartItem)
        {
            try
            {
                ValidationResult validationResult = await _validator.ValidateAsync(cartItem);
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

                var existingItem = await _context.CartItem
                    .Join(
                        _context.ShoppingCart,
                        item => item.CartID,
                        cart => cart.CartID,
                        (item, cart) => new { item, cart })
                    .Where(result => result.item.CartItemID == id && result.cart.UserId == userId)
                    .Select(result => result.item)
                    .FirstOrDefaultAsync();

                if (existingItem == null)
                {
                    return NotFound();
                }

                existingItem.Quantity = cartItem.Quantity;

                await _context.SaveChangesAsync();
                return Ok(existingItem);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpPost]
        public async Task<IActionResult> CreateCartItem([FromBody] CartItem cartItem)
        {
            try
            {
                ValidationResult validationResult = await _validator.ValidateAsync(cartItem);
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

                var cartBelongsToUser = await _context.ShoppingCart
                    .AnyAsync(cart => cart.CartID == cartItem.CartID && cart.UserId == userId);

                if (!cartBelongsToUser)
                {
                    return BadRequest("The selected cart does not belong to the current user.");
                }

                var existingItem = await _context.CartItem
                    .FirstOrDefaultAsync(item =>
                        item.CartID == cartItem.CartID &&
                        item.ProductID == cartItem.ProductID);

                if (existingItem is not null)
                {
                    existingItem.Quantity += cartItem.Quantity;
                    await _context.SaveChangesAsync();
                    return Ok(existingItem);
                }

                await _context.CartItem.AddAsync(cartItem);
                await _context.SaveChangesAsync();

                return Ok(cartItem);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteCartItem(int id)
        {
            try
            {
                var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
                if (string.IsNullOrEmpty(userId))
                {
                    return Unauthorized();
                }

                var cartItem = await _context.CartItem
                    .Join(
                        _context.ShoppingCart,
                        item => item.CartID,
                        cart => cart.CartID,
                        (item, cart) => new { item, cart })
                    .Where(result => result.item.CartItemID == id && result.cart.UserId == userId)
                    .Select(result => result.item)
                    .FirstOrDefaultAsync();

                if (cartItem == null)
                {
                    return NotFound();
                }

                _context.CartItem.Remove(cartItem);
                await _context.SaveChangesAsync();

                return Ok(cartItem);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }
    }
}
