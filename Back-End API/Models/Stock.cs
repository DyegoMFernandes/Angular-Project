using System.ComponentModel.DataAnnotations.Schema;

namespace AngularProject.Models
{
    [Table("Stock")]
    public class Stock
    {
        public int StockID { get; set; }
        public int ProductID { get; set; }
        public int Quantity { get; set; }

    }
}
