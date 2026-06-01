using AngularProject.Data;
using AngularProject.Models;
using FluentValidation;
using FluentValidation.Results;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace AngularProject.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class StockController : ControllerBase
    {
        readonly ApplicationDbContext _context;
        readonly IValidator<Stock> _validator;
        public StockController(ApplicationDbContext context, IValidator<Stock> validator)
        {
            _context = context;
            _validator = validator;
        }

        [HttpGet]
        public async Task<ActionResult<List<Stock>>> GetStocks()
        {
            try
            {
                return Ok(await _context.Stock.ToListAsync());
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }
        [HttpGet("{id}")]
        public async Task<IActionResult> GetStockById(int id)
        {
            try
            {
                var stock = await _context.Stock.FindAsync(id);
                if (stock == null)
                {
                    return NotFound();
                }
                return Ok(stock);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateStock(int id, [FromBody] Stock stock)
        {
            try
            {
                ValidationResult validationResult = await _validator.ValidateAsync(stock);
                if (!validationResult.IsValid)
                {
                    foreach (var error in validationResult.Errors)
                    {
                        ModelState.AddModelError(error.PropertyName, error.ErrorMessage);
                    }
                    return ValidationProblem(ModelState);
                }

                var results = await _context.Stock.FindAsync(id);

                if (results == null)
                {
                    return NotFound();
                }
                results.Quantity = stock.Quantity;

                await _context.SaveChangesAsync();
                return Ok(results);

            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpPost]
        public async Task<IActionResult> CreateStock([FromBody] Stock stock)
        {
            try
            {
                ValidationResult validationResult = await _validator.ValidateAsync(stock);
                if (!validationResult.IsValid)
                {
                    foreach (var error in validationResult.Errors)
                    {
                        ModelState.AddModelError(error.PropertyName, error.ErrorMessage);
                    }
                    return ValidationProblem(ModelState);
                }
                await _context.Stock.AddAsync(stock);
                await _context.SaveChangesAsync();
                return Ok(stock);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }


        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteStock(int id)
        {
            try
            {
                var stock = await _context.Stock.FindAsync(id);
                if (stock == null)
                {
                    return NotFound();
                }
                _context.Stock.Remove(stock);
                await _context.SaveChangesAsync();
                return Ok(stock);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }
    }
}
