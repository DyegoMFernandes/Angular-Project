using System.ComponentModel.DataAnnotations.Schema;

namespace AngularProject.Models
{
    [Table("ProductCategories")]
    public class ProductCategory
    {
        public int ProductID { get; set; }
        public int CategoryID { get; set; }
    }
}
