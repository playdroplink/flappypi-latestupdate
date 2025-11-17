import { createClient } from '@supabase/supabase-js';
import { shopItems } from './src/constants/shopItems';

const supabaseUrl = 'https://jsycagbgbhgozrwdcwsk.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpzeWNhZ2JnYmhnb3pyd2Rjd3NrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk1Mzg1NzMsImV4cCI6MjA2NTExNDU3M30.GroHV_QSRAUsY0s-uGA7-7ToxnV5gQXlfo4plVPlmoc';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function pushShopItems() {
  for (const item of shopItems) {
    const { error } = await supabase
      .from('shop_items')
      .upsert(item, { onConflict: 'id' });
    if (error) {
      console.error('Error uploading item:', item.id, error);
    } else {
      console.log('Uploaded:', item.id);
    }
  }
  console.log('All items pushed!');
}

pushShopItems(); 