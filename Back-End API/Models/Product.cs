using System.ComponentModel.DataAnnotations.Schema;

namespace AngularProject.Models
{
    [Table("Products")]
    public class Product
    {
        public int ProductID { get; set; }
        public string ProductName { get; set; }
        public string Description { get; set; }
        public decimal Price { get; set; }
    }
}
