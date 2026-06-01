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

    public class OrdersController : ControllerBase
    {
        readonly ApplicationDbContext _context;
        readonly IValidator<Order> _validator;
        public OrdersController(ApplicationDbContext context, IValidator<Order> validator)
        {
            _context = context;
            _validator = validator;
        }

        [HttpGet]
        public async Task<ActionResult<List<Order>>> GetOrders()
        {
            try
            {
                var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
                if (string.IsNullOrEmpty(userId))
                {
                    return Unauthorized();
                }

                return Ok(await _context.Order
                    .Where(o => o.UserId == userId)
                    .ToListAsync());
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }
        [HttpGet("{id}")]
        public async Task<IActionResult> GetOrderById(int id)
        {
            try
            {
                var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
                if (string.IsNullOrEmpty(userId))
                {
                    return Unauthorized();
                }

                var order = await _context.Order
                    .FirstOrDefaultAsync(o => o.OrderId == id && o.UserId == userId);

                if (order == null)
                {
                    return NotFound();
                }
                return Ok(order);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateOrder(int id, [FromBody] Order order)
        {
            try
            {
                ValidationResult validationResult = await _validator.ValidateAsync(order);
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

                var results = await _context.Order
                    .FirstOrDefaultAsync(o => o.OrderId == id && o.UserId == userId);

                if (results == null)
                {
                    return NotFound();
                }
                results.OrderDate = order.OrderDate;
                results.TotalAmount = order.TotalAmount;


                await _context.SaveChangesAsync();
                return Ok(results);

            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpPost]
        public async Task<IActionResult> CreateOrder([FromBody] Order order)
        {
            try
            {
                ValidationResult validationResult = await _validator.ValidateAsync(order);
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

                var shoppingCart = await _context.ShoppingCart
                    .FirstOrDefaultAsync(cart => cart.UserId == userId);

                if (shoppingCart == null)
                {
                    return BadRequest("No shopping cart was found for the current user.");
                }

                var cartItems = await _context.CartItem
                    .Where(item => item.CartID == shoppingCart.CartID)
                    .ToListAsync();

                if (cartItems.Count == 0)
                {
                    return BadRequest("The shopping cart is empty.");
                }

                decimal totalAmount = 0;

                foreach (var cartItem in cartItems)
                {
                    var stock = await _context.Stock
                        .FirstOrDefaultAsync(item => item.ProductID == cartItem.ProductID);

                    if (stock == null)
                    {
                        return BadRequest($"Stock was not found for product {cartItem.ProductID}.");
                    }

                    if (stock.Quantity < cartItem.Quantity)
                    {
                        return BadRequest($"Insufficient stock for product {cartItem.ProductID}.");
                    }

                    var product = await _context.Product
                        .FirstOrDefaultAsync(item => item.ProductID == cartItem.ProductID);

                    if (product == null)
                    {
                        return BadRequest($"Product {cartItem.ProductID} was not found.");
                    }

                    stock.Quantity -= cartItem.Quantity;
                    totalAmount += product.Price * cartItem.Quantity;
                }

                order.UserId = userId;
                order.OrderDate = DateTime.UtcNow;
                order.TotalAmount = totalAmount;

                await _context.Order.AddAsync(order);

                _context.CartItem.RemoveRange(cartItems);
                _context.ShoppingCart.Remove(shoppingCart);

                await _context.SaveChangesAsync();
                return Ok(order);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }


        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteOrder(int id)
        {
            try
            {
                var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
                if (string.IsNullOrEmpty(userId))
                {
                    return Unauthorized();
                }

                var order = await _context.Order
                    .FirstOrDefaultAsync(o => o.OrderId == id && o.UserId == userId);

                if (order == null)
                {
                    return NotFound();
                }
                _context.Order.Remove(order);
                await _context.SaveChangesAsync();
                return Ok(order);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }
    }
}
