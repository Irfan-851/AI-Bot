function calculateTotal() {
            
            let priceLaptop = parseInt(document.getElementById("priceLaptop").textContent);
            let priceSmartphone = parseInt(document.getElementById("priceSmartphone").textContent);
            let priceHeadphones = parseInt(document.getElementById("priceHeadphones").textContent);
            let priceTablet = parseInt(document.getElementById("priceTablet").textContent);

            
            let qtyLaptop = parseInt(document.getElementById("qtyLaptop").value) || 0;
            let qtySmartphone = parseInt(document.getElementById("qtySmartphone").value) || 0;
            let qtyHeadphones = parseInt(document.getElementById("qtyHeadphones").value) || 0;
            let qtyTablet = parseInt(document.getElementById("qtyTablet").value) || 0;

            
            let total = (qtyLaptop * priceLaptop) +
                        (qtySmartphone * priceSmartphone) +
                        (qtyHeadphones * priceHeadphones) +
                        (qtyTablet * priceTablet);

            document.getElementById("totalPrice").textContent = "Total Price: $" + total;
        }